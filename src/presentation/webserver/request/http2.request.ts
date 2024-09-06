import {RequestInterface} from "../request.interface";
import {ServerHttp2Stream, IncomingHttpHeaders} from "http2";

export class Http2Request implements RequestInterface {

  constructor(
    private stream: ServerHttp2Stream,
    private headers: IncomingHttpHeaders
  ) {
  }

  getBody(): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      this.stream.on('data', (chunk) => {
        body += chunk;
      });
      this.stream.on('end', () => {
        resolve(body);
      });
      this.stream.on('error', (err) => {
        reject(err);
      });
    });
  }

  getMethod(): string {
    return this.headers[':method'] || '';
  }

  getPath(): string {
    return this.headers[':path'] || '';
  }

}