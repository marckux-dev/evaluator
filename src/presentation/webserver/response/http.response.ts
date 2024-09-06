import {ResponseInterface} from "../response.interface";
import {ServerResponse} from "http";

export class HttpResponse implements ResponseInterface {

  constructor(
    private res: ServerResponse
  ) {}

  send(body: string): void {
    this.res.end(body);
  }

  setHeader(name: string, value: string): void {
    this.res.setHeader(name, value);
  }

  setStatus(code: number): void {
    this.res.statusCode = code;
  }

}