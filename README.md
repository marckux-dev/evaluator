# Evaluator

Evaluador de expresiones matemáticas escrito en TypeScript. Analiza y evalúa expresiones
aritméticas en notación estándar (infija), por ejemplo `3 + 4 * (2 - 1)`, o en notación polaca
inversa (RPN), y expone el resultado a través de una CLI o de un servidor HTTP.

Soporta operadores binarios (`+`, `-`, `*`, `/`, `^`), unarios (`-`, `+`, `!` factorial),
funciones (`sin`, `cos`, `sqrt`, `max`), constantes (`PI`, `E`) y paréntesis con la
precedencia y asociatividad habituales.

## Instalación

Requisitos: Node.js (v14 o superior) y npm.

```bash
git clone <url-del-repositorio>
cd evaluator
npm install
```

### Configuración

Copia la plantilla de variables de entorno y ajústala si es necesario:

```bash
cp .env.template .env
```

La única variable requerida es `PORT` (puerto del servidor web, por defecto `3000`). Es
obligatoria incluso en modo CLI, ya que se valida al arrancar la aplicación.

### Certificados TLS (obligatorio)

El servidor HTTP/2 carga `./keys/key.pem` y `./keys/cert.pem` al importarse el módulo, y ese
módulo se importa siempre desde `src/app.ts` — **aunque no uses el servidor HTTP/2**. Si los
ficheros no existen, la aplicación falla al arrancar con `ENOENT: no such file or directory,
open './keys/key.pem'`. Genera unos certificados autofirmados:

```bash
mkdir -p keys
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout keys/key.pem -out keys/cert.pem \
  -days 365 -subj "/CN=localhost"
```

## Funcionamiento

### Elegir el modo de ejecución (CLI o servidor web)

El modo se selecciona **editando `src/app.ts`**: hay que comentar/descomentar la línea de la
presentación que se quiera usar (no es un flag en tiempo de ejecución):

```ts
// const presentation = new CliPresentation(new ColorsPlugin());       // modo CLI
const presentation = new WebserverPresentation(new HttpServer());      // servidor http nativo
// const presentation = new WebserverPresentation(new ExpressServer()); // servidor Express
// const presentation = new WebserverPresentation(new Http2Server());   // servidor HTTP/2
```

Las tres implementaciones de servidor son intercambiables y se comportan igual.

### Realizar un cálculo desde la CLI

Con `CliPresentation` activada en `src/app.ts`, la expresión se pasa como argumento:

```bash
# en desarrollo (ts-node-dev; los argumentos van después de --)
npm run dev -- "3 + 4 * (2 - 1)"
# → 7

npm run dev -- "sqrt(2) ^ 2"
npm run dev -- "max(1, 5, 3) + 2!"
npm run dev -- "sin(PI / 2)"
```

También se puede compilar y ejecutar el bundle:

```bash
npm run build
node dist/bundle.js "3 + 4 * 2"
```

Si la expresión es inválida (símbolo desconocido, paréntesis desbalanceados, factorial de un
número negativo…), se muestra el error en rojo por consola.

### Realizar un cálculo con el servidor web

Con `WebserverPresentation` activada (es la opción por defecto), arranca el servidor:

```bash
npm run dev     # desarrollo, con recarga automática
# o bien
npm start       # compila y ejecuta dist/bundle.js
```

El servidor expone una única ruta: `POST /evaluate` con un cuerpo JSON `{ "expression": "..." }`.

```bash
curl -X POST http://localhost:3000/evaluate \
  -H "Content-Type: application/json" \
  -d '{"expression": "3 + 4 * (2 - 1)"}'
# → {"result":7}
```

Respuestas de error (código 400):

```json
{ "error": "Missing expression" }
{ "error": "$ is not a valid operator or constant" }
```

### Tests

```bash
npm test                  # todos los tests (jest, con cobertura)
npm run test:watch        # modo watch
npx jest ruta/al.test.ts  # un solo fichero de test
```

## Extender la funcionalidad

Los tokens (operadores, constantes y controladores) se **autorregistran**: al arrancar,
`tokens.register.ts` registra en el `TokenMapper` todas las clases exportadas desde
`src/domain/entities/operators/`, `constants/` y `controllers/`. Por eso, añadir un token nuevo
solo requiere crear su fichero y exportarlo desde el `index.ts` correspondiente — no hay que
tocar nada más.

### Añadir un operador nuevo

1. Crea un fichero en `src/domain/entities/operators/`, por ejemplo `modulo.operator.ts`:

```ts
import { OperatorEntity } from "../operator.entity";

const modulo = (n1: number, n2: number): number => n2 % n1;

export class ModuloOperator extends OperatorEntity {
  constructor() {
    super({
      operation: modulo,
      symbol: '%',
      precedence: 90,
    });
  }
}
```

2. Expórtalo en `src/domain/entities/operators/index.ts`:

```ts
export * from './modulo.operator';
```

Notas importantes sobre las opciones de `OperatorEntity`:

- **`operation`**: el número de operandos se infiere de `operation.length` (número de
  parámetros). Los operandos llegan en orden inverso al de la expresión, porque se sacan de una
  pila (fíjate en `pow.operator.ts`: `(n1, n2) => Math.pow(n2, n1)`). Para crear un operador
  **variádico** (número indefinido de operandos, separados por comas), pon
  `this.numberOfOperands = 0` en el constructor después de llamar a `super(...)` — consumirá
  operandos hasta un centinela EOF. Ver `max.operator.ts`.
- **`precedence`**: mayor número = mayor prioridad. Referencias actuales: `+`/`-` binarios usan
  precedencia baja, `*`/`/` media, funciones prefijas (`sin`, `sqrt`, `max`) usan 85, y `^` y
  `!` usan 95.
- **`position`**: `PREFIX`, `INFIX` (por defecto) o `POSTFIX` (como el factorial `!`).
- **`associativity`**: `LEFT` (por defecto) o `RIGHT` (como `^`).
- **`validation`** (opcional): función que valida los operandos antes de operar; debe lanzar un
  `ValueError` si no son válidos (ver `factorial.operator.ts`).

El símbolo puede ser un carácter (`%`, `#`…) o una palabra alfabética (`mod`, `sin`…); el
tokenizador reconoce ambos.

### Añadir una constante nueva

Igual de sencillo — crea el fichero en `src/domain/entities/constants/` y expórtalo en su
`index.ts`:

```ts
// src/domain/entities/constants/phi.constant.ts
import { ConstantEntity } from "../constant.entity";

export class Phi extends ConstantEntity {
  constructor() {
    super((1 + Math.sqrt(5)) / 2);
  }

  getSymbol(): string {
    return 'phi';
  }
}
```

### Añadir una implementación de servidor nueva

Implementa `ServerInterface` (`start`, `addRoute`) en `src/presentation/webserver/`, con sus
adaptadores `RequestInterface`/`ResponseInterface` en `request/` y `response/` (usa
`http.server.ts` como referencia), y selecciónala en `src/app.ts`. `WebserverPresentation` es
agnóstica del servidor concreto.

## Arquitectura

Para una descripción detallada de la arquitectura (modelo de tokens, pipeline de evaluación,
shunting-yard, etc.), consulta [CLAUDE.md](./CLAUDE.md).
