
import * as http from 'http';
import {ServerInterface} from "./server.interface";
import {HttpRequest} from "./request";
import {HttpResponse} from "./response";

export class HttpServer implements ServerInterface {

  private server: http.Server;
  private routes: { [key: string]: (req: HttpRequest, res: HttpResponse) => void } = {};

  constructor() {
    this.server = http.createServer((req, res) => {
      const request = new HttpRequest(req);
      const response = new HttpResponse(res);
      const handler = this.routes[`${request.getMethod()} ${request.getPath()}`];
      if (handler) {
        handler(request, response);
      } else {
        response.setStatus(404);
        response.send('Not Found');
      }
    });
  }

  addRoute(method: string, path: string, handler: (req: HttpRequest, res: HttpResponse) => void): void {
    this.routes[`${method} ${path}`] = handler;
  }

  start(portNumber: number): void {
    this.server.listen(portNumber, () => {console.log(`Server running at http://localhost:${portNumber}/`)});
  }

}