import {ResponseInterface} from "../response.interface";
import express from "express";

export class ExpressResponse implements ResponseInterface {

  constructor(
    private res: express.Response
  ) {}
  send(body: string): void {
    this.res.send(body);
  }

  setHeader(name: string, value: string): void {
    this.res.setHeader(name, value);
  }

  setStatus(code: number): void {
    this.res.status(code);
  }

}