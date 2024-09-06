import {RequestInterface} from "../request.interface";
import {IncomingMessage} from "http";

export class HttpRequest implements RequestInterface {

  constructor(
    private req: IncomingMessage
  ) {}

  getBody(): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      this.req.on('data', (chunk) => {
        body += chunk;
      });
      this.req.on('end', () => {
        resolve(body);
      });
      this.req.on('error', (err) => {
        reject(err);
      });
    });
  }

  getMethod(): string {
    return this.req.method || '';
  }

  getPath(): string {
    return this.req.url || '';
  }

}