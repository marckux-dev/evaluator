
export interface RequestInterface {
  getMethod(): string;
  getPath(): string;
  getBody(): Promise<string>;
}