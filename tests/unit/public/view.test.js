import { expect, describe, it, jest, beforeEach } from "@jest/globals";
import { JSDOM } from "jsdom";
import View from "../../../public/controller/js/view.js";

describe("View - test suite for view layer", () => {
  const dom = new JSDOM;
  global.document = dom.window.document;
  global.window = dom.window;

  function makeBtn({
    text,
    classList
  } = {
    text: "",
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    }
  }) {
    return {
      onclick: jest.fn(),
      classList,
      innerText: text,
    }
  }

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest
      .spyOn(document, document.getElementById.name)
      .mockReturnValue(makeBtn());
  });

  it("should add unassigned class and reset click handler if hide equals true", () => {
    const view = new View();
    const btn = makeBtn();
    jest
      .spyOn(document, document.querySelectorAll.name)
      .mockReturnValue([btn]);

    view.changeCommandButtonsVisibility();

    expect(btn.classList.add).toHaveBeenCalledWith('unassigned');
    expect(btn.onclick.name).toStrictEqual('onClickReset');
    expect(() => btn.onclick()).not.toThrow();
  });

  it("should remove unassigned class and reset click handler if hide equals false", () => {
    const view = new View();
    const btn = makeBtn();
    jest
      .spyOn(document, document.querySelectorAll.name)
      .mockReturnValue([btn]);

    view.changeCommandButtonsVisibility(false);

    expect(btn.classList.add).not.toHaveBeenCalled();
    expect(btn.classList.remove).toHaveBeenCalledWith('unassigned');
    expect(btn.onclick.name).toStrictEqual('onClickReset');
    expect(() => btn.onclick()).not.toThrow();
  });

  it("It should call onLoad", () => {
    const view = new View();
    const changeCommandButtonsVisibility = jest.spyOn(
      view,
      view.changeCommandButtonsVisibility.name
    );

    view.onLoad();
    expect(changeCommandButtonsVisibility).toHaveBeenCalled();
  });
});