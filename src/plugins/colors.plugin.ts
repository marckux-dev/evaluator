import {OutputColorInterface} from "../presentation/cli";
import colors from "colors";
export class ColorsPlugin implements OutputColorInterface {
  blue(text: string): string {
    return colors.blue(text);
  }

  green(text: string): string {
    return colors.green(text);
  }

  grey(text: string): string {
    return colors.grey(text);
  }

  red(text: string): string {
    return colors.red(text);
  }

  yellow(text: string): string {
    return colors.yellow(text);
  }

}