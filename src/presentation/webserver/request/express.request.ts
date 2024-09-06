import {RequestInterface} from "../request.interface";
import express from "express";

export class ExpressRequest implements RequestInterface {

  constructor(
    private req: express.Request
  ) {}

  getBody(): Promise<string> {
    return new Promise((resolve, reject)=>{
      try {
        resolve(JSON.stringify(this.req.body));
      } catch (error) {
        reject(error);
      }
    });
  }

  getMethod(): string {
    return this.req.method || '';
  }

  getPath(): string {
    return this.req.path || '';
  }

}