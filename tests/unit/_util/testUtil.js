import { jest } from "@jest/globals";
import { Readable, Writable } from "stream";

export default class TestUtils {
  static generateReadableStream(data) {
    return new Readable({
      read() {
        for(const item of data) {
          this.push(item);
        }
        this.push(null);
      }
    });
  }
  
  static generateWritableStream(onData) {
    return new Writable({
      write(chunck, enc, cb) {
        onData(chunck);
        cb(null, chunck);
      }
    });
  }

  static defaultHandleParams() {
    const requestStream = TestUtils.generateReadableStream(['Request body']);
    const writableStream = TestUtils.generateWritableStream(() => {});
    const data = {
      request: Object.assign(requestStream, {
        headers: {},
        method: '',
        url: '',
      }),
      response: Object.assign(writableStream, {
        writeHead: jest.fn(),
        end: jest.fn(),
      }),
    };

    return {
      values: () => Object.values(data),
      ...data,
    }
  }
}