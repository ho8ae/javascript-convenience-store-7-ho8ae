import { readFileSync } from "fs";
import Product from "../../domain/Product.js";

class ProductRepository {
  #filePath = "public/products.md";

  loadProducts(path = this.#filePath) {
    try {
      const content = readFileSync(path, "utf8");

      const lines = content.split("\n").slice(1); // 헤더 제외

      return lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [name, price, quantity, promotion] = line
            .split(",")
            .map((item) => item.trim());

          if (!name || !price || !quantity) {
            throw new Error("[ERROR] 잘못된 데이터 형식입니다.");
          }

          return new Product(
            name,
            Number(price),
            Number(quantity),
            promotion === "null" ? null : promotion,
          );
        });
    } catch (error) {
      if (error.message.startsWith("[ERROR]")) {
        throw error;
      }
      throw new Error("[ERROR] 상품 정보를 불러오는데 실패했습니다.");
    }
  }

  findProductWithPromotion(name) {
    const products = this.loadProducts();
    return products.find(
      (product) => product.name === name && product.promotion,
    );
  }

  findProduct(name) {
    const products = this.loadProducts();
    const product = products.find((p) => p.name === name);
    if (!product) {
      throw new Error("[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.");
    }
    return product;
  }
}

export default ProductRepository;
