import {ServerInterface} from "./server.interface";
import * as http2 from "http2";
import * as fs from "node:fs";
import {Http2Request} from "./request";
import {Http2Response} from "./response";
import {RequestInterface} from "./request.interface";
import {ResponseInterface} from "./response.interface";

const serverOptions = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem')
};

export class Http2Server implements ServerInterface {
  private server: http2.Http2Server;
  private routes: { [key: string]: (req: Http2Request, response: Http2Response) => void } = {};

  constructor() {
    this.server = http2.createSecureServer(serverOptions);
    this.server.on('stream', (stream, headers) => {
      const request = new Http2Request(stream, headers);
      const response = new Http2Response(stream);
      const handler = this.routes[`${request.getMethod()} ${request.getPath()}`];
      if (handler) {
        handler(request, response);
      } else {
        response.setStatus(404);
        response.send('Not Found');
      }
    });

  }

  addRoute(method: string, path: string, handler: (req: RequestInterface, res: ResponseInterface) => void): void {
    this.routes[`${method} ${path}`] = handler;
  }

  start(portNumber: number): void {
    this.server.listen(portNumber, () => {console.log(`HTTP/2 Server running at https://localhost:${portNumber}`)});
  }
}