import ConvenienceController from "./controller/ConvenienceController.js";

class App {
  #controller;

  constructor() {
    this.#controller = new ConvenienceController();
  }

  async run() {
    await this.#controller.start();
  }
}

export default App;
