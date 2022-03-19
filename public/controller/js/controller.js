export default class Controller {
  constructor({ view, service }) {
    this.view = view;
    this.service = service;
  }

  static init(deps) {
    const controller = new Controller(deps);
    controller.onLoad();
    return controller;
  }

  onLoad() {
    this.view.onLoad();
  }
}