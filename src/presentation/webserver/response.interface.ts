
export interface ResponseInterface {
  setHeader(name: string, value: string): void;
  setStatus(code: number): void;
  send(body: string): void;
}