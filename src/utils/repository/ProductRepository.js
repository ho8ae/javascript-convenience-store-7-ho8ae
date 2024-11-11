import { readFileSync } from "fs";
import Product from "../../domain/Product.js";
import {
  ERROR_MESSAGES,
  STRING_PATTERNS,
  NUMBERS,
} from "../../constants/index.js";

class ProductRepository {
  #filePath = "public/products.md";
  static #instance = null;
  #products = [];

  constructor() {
    if (ProductRepository.#instance) {
      return ProductRepository.#instance;
    }
    ProductRepository.#instance = this;
    this.loadProducts();
  }

  loadProducts(path = this.#filePath) {
    try {
      const content = readFileSync(path, STRING_PATTERNS.FileEncoding);
      const lines = content
        .split(STRING_PATTERNS.NewLine)
        .slice(1)
        .filter((line) => line.trim());

      this.#products = lines.map((line) => {
        const [name, price, quantity, promotion] = line
          .split(STRING_PATTERNS.Comma)
          .map((item) => item.trim());

        const parsedQuantity = this.#parseQuantity(quantity);
        const parsedPromotion = this.#parsePromotion(promotion);

        return new Product(
          name,
          Number(price),
          parsedQuantity,
          parsedPromotion,
        );
      });

      return this.#products;
    } catch (error) {
      if (error.message.startsWith(STRING_PATTERNS.ErrorPrefix)) throw error;
      throw new Error(ERROR_MESSAGES.LoadProductFail);
    }
  }

  #parseQuantity(quantity) {
    if (quantity === "없음") {
      return NUMBERS.Zero;
    }
    return Number(quantity);
  }

  #parsePromotion(promotion) {
    if (promotion === "null") {
      return null;
    }
    return promotion;
  }

  findProductWithPromotion(name) {
    return this.#products.find((p) => p.name === name && p.promotion);
  }

  findProduct(name) {
    const product = this.#products.find((p) => p.name === name);
    if (!product) {
      throw new Error(ERROR_MESSAGES.InvalidProduct);
    }
    return product;
  }

  getProducts() {
    return this.#products;
  }

  updateProducts(updatedProducts) {
    this.#products = updatedProducts;
  }

  updateStock(name, quantity, isPromotion) {
    this.#products = this.#products.map((product) => {
      if (
        product.name === name &&
        (isPromotion ? product.promotion : !product.promotion)
      ) {
        return new Product(
          product.name,
          product.price,
          Math.max(NUMBERS.Zero, product.quantity - quantity),
          product.promotion,
        );
      }
      return product;
    });
  }

  getTotalStock(name) {
    return this.#products
      .filter((p) => p.name === name)
      .reduce((sum, p) => sum + p.quantity, NUMBERS.Zero);
  }

  hasProduct(name) {
    return this.#products.some((p) => p.name === name);
  }
}

export default ProductRepository;
