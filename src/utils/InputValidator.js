class InputValidator {
  static isValidPurchaseFormat(input) {
    const itemPattern = /^\[([^\-\]]+)-([1-9]\d*)\]$/;
    const items = input.split(",");

    return items.every((item) => {
      const trimmedItem = item.trim();
      return itemPattern.test(trimmedItem);
    });
  }

  static validatePurchaseFormat(input) {
    if (!this.isValidPurchaseFormat(input)) {
      throw new Error(
        "[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요."
      );
    }
  }

  static parseInput(input) {
    return input.split(",").map((item) => {
      const trimmedItem = item.trim();
      const firstHyphenIndex = trimmedItem.indexOf("-");
      const lastHyphenIndex = trimmedItem.lastIndexOf("-");

      if (firstHyphenIndex !== lastHyphenIndex) {
        throw new Error("[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.");
      }

      const matches = trimmedItem.match(/^\[([^\-\]]+)-(-?\d*\.?\d*)\]$/);

      if (!matches) {
        throw new Error(
          "[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요."
        );
      }

      const quantity = Number(matches[2]);
      if (quantity <= 0 || !Number.isInteger(quantity)) {
        throw new Error("[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.");
      }

      return {
        name: matches[1].trim(),
        quantity,
      };
    });
  }

  static validateQuantity(input) {
    try {
      this.parseInput(input);
    } catch (error) {
      if (error.message.includes("잘못된 입력입니다")) {
        throw error;
      }
      throw new Error("[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.");
    }
  }

  static validateProduct(input, productRepository) {
    const products = this.parseInput(input);
    const allProducts = productRepository.loadProducts();

    products.forEach(({ name }) => {
      const productExists = allProducts.some((p) => p.name === name);
      if (!productExists) {
        throw new Error(
          "[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요."
        );
      }
    });
  }

  static validateStock(input, productRepository) {
    const products = this.parseInput(input);
    const allProducts = productRepository.loadProducts();

    products.forEach(({ name, quantity }) => {
      const product = allProducts.find((p) => p.name === name);
      if (product && product.quantity < quantity) {
        throw new Error(
          "[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요."
        );
      }
    });
  }

  static validateMembershipInput(input) {
    const upperInput = input?.toUpperCase();
    if (upperInput !== "Y" && upperInput !== "N") {
      throw new Error("[ERROR] Y 또는 N만 입력 가능합니다.");
    }
  }
}

export default InputValidator;