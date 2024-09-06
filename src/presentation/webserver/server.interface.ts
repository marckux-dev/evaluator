import {RequestInterface} from "./request.interface";
import {ResponseInterface} from "./response.interface";

export interface ServerInterface {
  start: (portNumber: number) => void;
  addRoute: (method: string, path: string, handler: (req: RequestInterface, res: ResponseInterface) => void) => void;
}