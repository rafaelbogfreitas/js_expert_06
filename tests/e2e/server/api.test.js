import { expect, describe, it, beforeEach, jest, test } from "@jest/globals";
import config from "../../../server/config";
import Server from "../../../server/server.js";
import supertest from 'supertest';
import portfinder from 'portfinder';
import { Transform } from "stream";
import { setTimeout } from "timers/promises";
const getAvailablePort = portfinder.getPortPromise;
const RETENTION_DATA_PERIOD = 200;

describe("API e2e Test Suite", () => {
  const commandResponse = JSON.stringify({ result: "ok" });

  function pipeAndReadStreamData(stream, onChunk) {
    const transform = new Transform({
      transform: (chunk, enc, cb) => {
        onChunk(chunk);

        cb(null, chunk);
      }
    })
    return stream.pipe(transform);
  }

  describe('client workflow', () => {

    async function getTestServer() {
      const getSuperTest = port => superTest(`http://localhost:${port}`);
      const port = await getAvailablePort();
      return new Promise((resolve, reject) => {
        const server = Server;
        server.listen(port)
         .once("listening", () => {
           const testServer = getSuperTest(port);
           const response = {
             testServer,
             kill() {
              server.close();
             }
           }

           return resolve(response);
         })
         .once('error', reject);
      })
    }

    function commandSender(testServer) {
      return {
        async send(command) {
          const response = await testServer.post("/controller")
          .send({ command });

          expect(response.text).toStrictEqual(commandResponse);
        }
      }
    } 

    it("should not receive data stream if the process in not playing", async () => {
      const server = await getTestServer();
      const onChunk = jest.fn();
      
      pipeAndReadStreamData(server.testServer.get('/stream'), onChunk);
      await setTimeout(RETENTION_DATA_PERIOD);
      server.kill();

      expect(onChunk).not.toHaveBeenCalled();
    });

    it("should receive data stream if the process in playing", async () => {
      const server = await getTestServer();
      const onChunk = jest.fn();
      const { send } = commandSender(server.testServer);

      await send("start");
      await setTimeout(RETENTION_DATA_PERIOD);
      await send("stop");

      const [[buffer]] = onChunk.mock.calls;
      console.log('calls', buffer);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);

      server.kill();
    });
  })
});