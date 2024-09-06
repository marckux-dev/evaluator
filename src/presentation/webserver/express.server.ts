
import express, {Express} from 'express';
import {ServerInterface} from "./server.interface";
import {RequestInterface} from "./request.interface";
import {ResponseInterface} from "./response.interface";
import {ExpressRequest} from "./request";
import {ExpressResponse} from "./response/express.response";

export class ExpressServer implements ServerInterface {
  private server: Express;

  constructor() {
    this.server = express();
    this.server.use(express.json());
  }

  addRoute(method: string, path: string, handler: (req: RequestInterface, res: ResponseInterface) => void): void {
    method = method.toLowerCase();
    switch (method) {
      case 'post':
        this.server.post(path, (req, res) => {
          const request = new ExpressRequest(req);
          const response = new ExpressResponse(res);
          handler(request, response);
        });
        break;
      default:
        throw new Error('Method not supported');
    }

  }

  start(portNumber: number): void {
    this.server.listen(portNumber, () => {console.log(`Express Server running at http://localhost:${portNumber}/`)});
  }

}