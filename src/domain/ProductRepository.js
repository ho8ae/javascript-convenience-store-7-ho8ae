import { readFileSync } from "fs";
import Product from "./Product.js";

class ProductRepository {
  #filePath = "public/products.md";

  loadProducts() {
    try {
      const content = readFileSync(this.#filePath, "utf8");
      const lines = content.split("\n").slice(1);

      return lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [name, price, quantity, promotion] = line.split(",");
          return new Product(name, price, quantity, promotion?.trim() || null);
        });
    } catch (error) {
      throw new Error("[ERROR] 상품 정보를 불러오는데 실패했습니다.");
    }
  }
}

export default ProductRepository;
