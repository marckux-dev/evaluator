import {PresentationInterface} from "../presentation.interface";
import {OutputColorInterface} from "./output-color.interface";
import {EvaluateStandardExpressionUsecase} from "../../application/usecases/evaluate-standard-expression.usecase";
import {EvaluatorInterface} from "../../application/usecases/evaluator.interface";


export class CliPresentation implements PresentationInterface {
  private readonly outputColor: OutputColorInterface;
  private evaluator: EvaluatorInterface;

  constructor(outputColor: OutputColorInterface) {
    this.outputColor = outputColor;
    this.evaluator = new EvaluateStandardExpressionUsecase();
  }

  async run(params: object | undefined): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error(this.outputColor.red("No expression provided"));
      return;
    }

    const expression = args.join(" ");

    try {
      const result = this.evaluator.execute(expression);
      console.log(this.outputColor.green(result.toString()));
    } catch (error) {
      console.error(this.outputColor.red(`${error}`));
    }

  }

}