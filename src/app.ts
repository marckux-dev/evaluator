import {PresentationInterface} from "./presentation";
import {CliPresentation} from "./presentation/cli";
import {ColorsPlugin} from "./plugins";
import {HttpServer, ExpressServer, WebserverPresentation, Http2Server} from "./presentation/webserver";

// Select the presentation interface to use
//const presentation = new CliPresentation(new ColorsPlugin());
// const presentation = new WebserverPresentation(new HttpServer());
const presentation = new WebserverPresentation(new ExpressServer());
// const presentation = new WebserverPresentation(new Http2Server());

class App {
  private presentation: PresentationInterface;

  constructor(presentation: PresentationInterface) {
    this.presentation = presentation;
  }

  async run(params?: object): Promise<void> {
    this.presentation.run(params);
  }

}

const main = async (): Promise<void> => {
  const app = new App(presentation);
  await app.run();
}

(async () => {
  await main();
})();
