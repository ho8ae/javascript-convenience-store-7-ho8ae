import ConvenienceController from "./controller/ConvenienceController.js";

class App {
  #controller;

  constructor() {
    this.#controller = new ConvenienceController();
  }

  async run() {
    try {
      await this.#controller.start();
    } catch (error) {
      if (error.message === "NO INPUT") {
        return;
      }
      throw error;
    }
  }
}

export default App;