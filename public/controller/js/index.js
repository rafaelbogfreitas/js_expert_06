import View from "./view.js";
import Controller from "./controller.js";
import Service from "./service.js";

const url = `${window.location.origin}/controller`;

const controller = Controller.init({
  view: new View(),
  service: new Service({ url }),
});