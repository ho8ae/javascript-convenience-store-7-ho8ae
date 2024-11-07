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
    if (!name || name.trim() === "") {
      throw new Error("[ERROR] 상품명은 필수입니다.");
    }
    if (isNaN(price) || price <= 0) {
      throw new Error("[ERROR] 가격은 0보다 큰 숫자여야 합니다.");
    }
    if (isNaN(quantity) || quantity < 0) {
      throw new Error("[ERROR] 수량은 0 이상의 숫자여야 합니다.");
    }
  }
}

export default Product;
