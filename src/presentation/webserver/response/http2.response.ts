import { ResponseInterface } from "../response.interface";
import { ServerHttp2Stream } from "http2";

export class Http2Response implements ResponseInterface {
  private headers: { [key: string]: any } = { ':status': 200 }; // Default status 200
  private headersSent = false; // Track if headers have been sent

  constructor(private stream: ServerHttp2Stream) {}

  // Send the body and flush headers if not already sent
  send(body: string): void {
    if (!this.headersSent) {
      this.stream.respond(this.headers); // Send headers in one go
      this.headersSent = true;
    }
    this.stream.end(body); // Send body and close the stream
  }

  // Accumulate headers until they are sent
  setHeader(name: string, value: string): void {
    if (!this.headersSent) {
      this.headers[name] = value; // Add header to headers object
    }
  }

  // Set status code (default 200)
  setStatus(code: number): void {
    if (!this.headersSent) {
      this.headers[':status'] = code; // Set status in headers object
    }
  }
}
