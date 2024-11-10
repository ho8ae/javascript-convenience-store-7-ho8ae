import { readFileSync } from "fs";
import Product from "../../domain/Product.js";

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
      const content = readFileSync(path, "utf8");
      const lines = content
        .split("\n")
        .slice(1)
        .filter((line) => line.trim());

      this.#products = lines.map((line) => {
        const [name, price, quantity, promotion] = line
          .split(",")
          .map((item) => item.trim());
        return new Product(
          name,
          Number(price),
          quantity === "없음" ? 0 : Number(quantity),
          promotion === "null" ? null : promotion,
        );
      });

      return this.#products;
    } catch (error) {
      if (error.message.startsWith("[ERROR]")) throw error;
      throw new Error("[ERROR] 상품 정보를 불러오는데 실패했습니다.");
    }
  }

  findProductWithPromotion(name) {
    return this.#products.find((p) => p.name === name && p.promotion);
  }

  findProduct(name) {
    const product = this.#products.find((p) => p.name === name);
    if (!product) {
      throw new Error("[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.");
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
          Math.max(0, product.quantity - quantity),
          product.promotion,
        );
      }
      return product;
    });
  }

  getTotalStock(name) {
    return this.#products
      .filter((p) => p.name === name)
      .reduce((sum, p) => sum + p.quantity, 0);
  }

  hasProduct(name) {
    return this.#products.some((p) => p.name === name);
  }
}

export default ProductRepository;