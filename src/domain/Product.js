import {
  ERROR_MESSAGES,
  NUMBERS,
  STRING_PATTERNS,
} from "../constants/index.js";

class Product {
  #name;
  #price;
  #quantity;
  #promotion;

  constructor(name, price, quantity, promotion) {
    this.validateProduct(name, price, quantity);
    this.#name = name;
    this.#price = Number(price);
    this.#quantity = Number(quantity);
    this.#promotion = promotion;
  }

  get name() {
    return this.#name;
  }

  get price() {
    return this.#price;
  }

  get quantity() {
    return this.#quantity;
  }

  get promotion() {
    return this.#promotion;
  }

  validateProduct(name, price, quantity) {
    if (!name || name.trim() === STRING_PATTERNS.Empty) {
      throw new Error(ERROR_MESSAGES.ProductNameRequired);
    }
    if (isNaN(price) || price <= NUMBERS.Zero) {
      throw new Error(ERROR_MESSAGES.InvalidPrice);
    }
    if (isNaN(quantity) || quantity < NUMBERS.Zero) {
      throw new Error(ERROR_MESSAGES.InvalidQuantity);
    }
  }
}

export default Product;
