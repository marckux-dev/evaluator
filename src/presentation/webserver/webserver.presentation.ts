import {PresentationInterface} from "../presentation.interface";
import {ServerInterface} from "./server.interface";
import {EvaluateStandardExpressionUsecase} from "../../application/usecases/evaluate-standard-expression.usecase";
import {RequestInterface} from "./request.interface";
import {ResponseInterface} from "./response.interface";

export class WebserverPresentation implements PresentationInterface {

  constructor(
    private readonly server: ServerInterface,
  ){}

  async run(params: object | undefined): Promise<void> {

    const evaluator = new EvaluateStandardExpressionUsecase();

    this.server.addRoute('POST', '/evaluate', async (req: RequestInterface, res: ResponseInterface) => {
      const body = await req.getBody();
      try {
        const {expression} = JSON.parse(body);
        if (!expression) {
          res.setStatus(400);
          res.send(JSON.stringify({error: 'Missing expression'}));
          return;
        }
        const result = evaluator.execute(expression);
        res.setHeader('Content-Type', 'application/json');
        res.setStatus(200);
        res.send(JSON.stringify({result}));
      } catch (error: any) {
        res.setStatus(400);
        res.send(JSON.stringify({error: error.message}));
      }
    })

    this.server.start(3000);
  }
}