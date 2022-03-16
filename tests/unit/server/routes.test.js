import { expect, describe, it, beforeEach, jest, test } from "@jest/globals";
import config from "../../../server/config";
import { Controller } from "../../../server/controller";
import { handler } from "../../../server/router";
import TestUtils from "../_util/testUtil";

describe("#Routes - test suite for api response", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("GET / - should redirect to homepage", async () => {
    const params = TestUtils.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/";
    
    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalled();
    expect(params.response.writeHead).toHaveBeenCalledWith(
      302,
      { Location: config.location.home }
    );
  });

  test(`GET /home - should respond with ${config.pages.home} file stream`, async () => {
    const params = TestUtils.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/home";
    const mockFileStream = TestUtils.generateReadableStream('data');

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({ stream: mockFileStream });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(config.pages.home);
  });

  test(`GET /controller - should respond with ${config.pages.controller} file stream`, async () => {
    const params = TestUtils.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/controller";
    const mockFileStream = TestUtils.generateReadableStream('data');

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({ stream: mockFileStream });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(config.pages.controller);
  });

  test(`GET /file.ext - should respond with file stream`, async () => {
    const params = TestUtils.defaultHandleParams();
    const filename = "/index.html";
    const expectedType = ".html";
    params.request.method = "GET";
    params.request.url = filename;
    const mockFileStream = TestUtils.generateReadableStream('data');

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({ stream: mockFileStream, type: expectedType });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());
    
    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(filename);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).toHaveBeenCalledWith(
      200,
      { "Content-type": config.constants.CONTENT_TYPE[".html"] }
    );
  });

  test(`GET /unknown - should respond with 404`, async () => {
    const params = TestUtils.defaultHandleParams();
    params.request.method = "POST";
    params.request.url = "/unknown";

    await handler(...params.values());
    
    expect(params.response.writeHead).toHaveBeenCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  });

  describe('exceptions', () => {
    test('given inexistent file it should respond with 404', async () => {
      const params = TestUtils.defaultHandleParams();
      params.request.method = "GET";
      params.request.url = "/index.png";

      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name
      ).mockRejectedValue(new Error("Error: ENOENT: no such file or directory"));
  
      await handler(...params.values());
      
      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });
    
    test('given an error it should respond with 500', async () => {
      const params = TestUtils.defaultHandleParams();
      params.request.method = "GET";
      params.request.url = "/index.png";

      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name
      ).mockRejectedValue(new Error("Error:"));
  
      await handler(...params.values());
      
      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    });
  });
});