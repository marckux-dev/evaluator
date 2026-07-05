# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A TypeScript math expression evaluator (from a Udemy course). It parses and evaluates arithmetic
expressions — either standard infix notation (`3 + 4 * (2 - 1)`) or RPN — and exposes the result
via a CLI or an HTTP server. There is no README; this file is the primary source of orientation.

## Commands

```bash
npm test                 # run all tests (jest, with coverage collection on)
npm run test:watch       # watch mode
npm run test:coverage    # explicit coverage run
npx jest path/to.test.ts # run a single test file
npx jest -t "name"       # run tests matching a name pattern

npm run dev              # run src/app.ts directly via ts-node-dev (auto-restart)
npm run dev:debug        # same, without --respawn (for attaching a debugger)

npm run build             # bundles src/app.ts -> dist/bundle.js via esbuild (esbuild.config.ts)
npm start                 # build then run dist/bundle.js
```

There is no lint script configured. `tsconfig.json` has `strict: true`.

Environment: copy `.env.template` to `.env`. Only `PORT` is required (validated via `env-var` in
`src/config/envs.ts`, loaded with `dotenv/config`).

Gotcha: `http2.server.ts` reads `./keys/key.pem` and `./keys/cert.pem` at module load time, and
`app.ts` imports it unconditionally — so the app crashes at startup (ENOENT) in *every* mode
unless those files exist. Generate self-signed certs into `./keys/` first (see README.md).

## Architecture

Layered/hexagonal-ish structure under `src/`:

- `domain/entities` — pure evaluation model, no framework or I/O dependencies.
- `application` — builders/mappers/usecases that turn a raw string into a domain `ExpressionEntity`
  and evaluate it.
- `presentation` — swappable front ends (CLI, three interchangeable web server implementations)
  that call into `application/usecases`.

### Entry point and presentation swap

`src/app.ts` picks exactly one `PresentationInterface` implementation and runs it with `envs`. To
switch between CLI and webserver mode (or between the three server backends), **comment/uncomment
the relevant line in `src/app.ts`** — this is a manual, source-level switch, not a runtime flag:

```ts
// const presentation = new CliPresentation(new ColorsPlugin());
const presentation = new WebserverPresentation(new HttpServer());
// const presentation = new WebserverPresentation(new ExpressServer());
// const presentation = new WebserverPresentation(new Http2Server());
```

`presentation/webserver` has three parallel server implementations (`HttpServer`, `ExpressServer`,
`Http2Server`) all implementing `ServerInterface` (`start`, `addRoute`), each with its own
`RequestInterface`/`ResponseInterface` adapter in `request/` and `response/`. `WebserverPresentation`
is server-agnostic and only exposes one route: `POST /evaluate` with JSON body `{ expression }`,
returning `{ result }` or `{ error }`.

### Token model (domain/entities)

Everything the evaluator manipulates implements `TokenInterface` (`getSymbol()`):

- `ConstantEntity` — a numeric value.
- `OperatorEntity` — configured via `OperatorEntityOptions` (symbol, `operation`, optional
  `validation`, `precedence`, `position`: PREFIX/INFIX/POSTFIX, `associativity`: LEFT/RIGHT).
  Number of operands is inferred from `operation.length` (0 = variadic/collect-until-EOF, see
  `MaxOperator`). Concrete operators live in `domain/entities/operators/` (one file per operator:
  addition, subtraction, multiplication, division, pow, negation, positive, factorial, sinus,
  cosinus, square-root, max) and are auto-registered — adding a new operator file + export in
  `operators/index.ts` is enough, no other wiring needed.
- `ControllerEntity` — structural, non-value tokens: `(`, `)`, `,`, and `EofController` (sentinel
  used by variadic operators like `MaxOperator` to know when to stop popping operands).
- `ConstantEntity` subclasses in `domain/entities/constants/` (`Pi`, `E`) are registered the same
  auto-discovery way.

`TokenMapper` (singleton, `application/mappers/token.mapper.ts`) maps a symbol string to its token
class. `tokens.register.ts` bulk-registers every export from `operators/`, `constants/`, and
`controllers/` via `Object.values(...)` — this is why each token is its own file with its own
default-constructible class (`new TokenClass()`), rather than being centrally listed.

### Evaluation pipeline

1. `FormatterUsecase.execute` — regex-based tokenizing prep: inserts spaces around symbols/words so
   the expression can be `split(' ')`.
2. `ExpressionBuilder.tokenize()` — maps each string piece to a `TokenInterface` (numbers become
   `ConstantEntity`, everything else looked up via `TokenMapper`).
3. For standard (infix) expressions, `StandardExpressionBuilder` (extends `ExpressionBuilder`) adds:
   - `manageOperatorOverload()` — disambiguates `+`/`-` as unary (`PositiveOperator`/
     `NegationOperator`) vs binary based on the preceding token.
   - `toRpn()` — shunting-yard conversion to RPN, using bracket nesting (`level`, in steps of 100
     added to precedence) to handle parens, and operator precedence/associativity/position for
     ordering. POSTFIX operators (e.g. factorial `!`) go straight to the output stack.
4. `ExpressionEntity.evaluate()` — executes RPN tokens against a stack: constants/controllers get
   pushed, operators call `execute(stack)` which pops operands (respecting `EofController` for
   variadic operators), runs `validation` then `operation`, and pushes a new `ConstantEntity`.
5. `ExpressionEntity.getValue()` — asserts evaluation collapsed to exactly one `ConstantEntity` and
   returns its numeric value; throws `InvalidExpressionError` otherwise.

Two usecases wire this up (`application/usecases/`): `EvaluateRpnExpressionUseCase` (steps 1-2 + 4-5,
no infix handling) and `EvaluateStandardExpressionUsecase` (full pipeline via
`StandardExpressionBuilder`), both implementing `EvaluatorInterface.execute(expression): number`.

Errors are domain-specific: `InvalidExpressionError` (malformed expression/brackets/unknown symbol)
and `ValueError` (e.g. factorial of a negative or non-integer), both in `domain/entities/errors/`.
