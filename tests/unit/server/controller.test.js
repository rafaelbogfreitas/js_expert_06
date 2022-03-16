import { expect, describe, it, beforeEach, jest } from "@jest/globals";
import { Controller } from "../../../server/controller";
import { Service } from "../../../server/service";
import TestUtils from "../_util/testUtil";

describe("#Controller - test suite for api controllers", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("should return a file stream", async () => {
    const mockFileStream = TestUtils.generateReadableStream(['data']);
    const fileType = '.html';

    const mockFileStreamReturn = jest.spyOn(
      Service.prototype,
      Service.prototype.getFileStream.name
    ).mockReturnValue({
      stream: mockFileStream,
      type: fileType,
    });
    
    const controller = new Controller();
    const controllerReturn = await controller.getFileStream("/index.html");

    expect(mockFileStreamReturn).toHaveBeenCalledTimes(1);
    expect(mockFileStreamReturn).toBeCalledWith("/index.html");
    expect(controllerReturn).toStrictEqual({
      stream: mockFileStream,
      type: fileType,
    });
  });
});