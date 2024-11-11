import {
  ERROR_MESSAGES,
  STRING_PATTERNS,
  NUMBERS,
  INPUTS,
} from "../constants/index.js";

class InputValidator {
  static isValidPurchaseFormat(input) {
    const items = input.split(STRING_PATTERNS.Comma);
    return items.every(this.#isValidItemFormat);
  }

  static #isValidItemFormat(item) {
    const trimmedItem = item.trim();
    return STRING_PATTERNS.ProductInputRegex.test(trimmedItem);
  }

  static validatePurchaseFormat(input) {
    if (!this.isValidPurchaseFormat(input)) {
      throw new Error(ERROR_MESSAGES.InvalidFormat);
    }
  }

  static parseInput(input) {
    const items = input.split(STRING_PATTERNS.Comma);
    return items.map(this.#parseItem);
  }

  static #parseItem(item) {
    const trimmedItem = item.trim();
    InputValidator.#validateHyphenCount(trimmedItem);

    const matches = InputValidator.#extractMatches(trimmedItem);
    const quantity = InputValidator.#parseQuantity(
      matches[NUMBERS.SecondMatch],
    );

    return {
      name: matches[NUMBERS.FirstMatch].trim(),
      quantity,
    };
  }

  static #validateHyphenCount(trimmedItem) {
    const firstHyphenIndex = trimmedItem.indexOf(STRING_PATTERNS.Hyphen);
    const lastHyphenIndex = trimmedItem.lastIndexOf(STRING_PATTERNS.Hyphen);

    if (firstHyphenIndex !== lastHyphenIndex) {
      throw new Error(ERROR_MESSAGES.InvalidInput);
    }
  }

  static #extractMatches(trimmedItem) {
    const matches = trimmedItem.match(STRING_PATTERNS.ProductInputRegex);
    if (!matches) {
      throw new Error(ERROR_MESSAGES.InvalidFormat);
    }
    return matches;
  }

  static #parseQuantity(quantityStr) {
    const quantity = Number(quantityStr);
    if (quantity <= NUMBERS.Zero || !Number.isInteger(quantity)) {
      throw new Error(ERROR_MESSAGES.InvalidInput);
    }
    return quantity;
  }

  static validateQuantity(input) {
    try {
      this.parseInput(input);
    } catch (error) {
      if (error.message.includes(ERROR_MESSAGES.InvalidInput)) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.InvalidInput);
    }
  }

  static validateProduct(input, productRepository) {
    const products = this.parseInput(input);
    products.forEach(this.#validateProductExists(productRepository));
  }

  static #validateProductExists(productRepository) {
    return ({ name }) => {
      if (!productRepository.hasProduct(name)) {
        throw new Error(ERROR_MESSAGES.InvalidProduct);
      }
    };
  }

  static validateStock(input, productRepository) {
    const products = this.parseInput(input);
    products.forEach(this.#validateStockAvailable(productRepository));
  }

  static #validateStockAvailable(productRepository) {
    return ({ name, quantity }) => {
      const totalStock = productRepository.getTotalStock(name);
      if (quantity > totalStock) {
        throw new Error(ERROR_MESSAGES.ExceededStock);
      }
    };
  }

  static validateMembershipInput(input) {
    const upperInput = input?.toUpperCase();
    if (upperInput !== INPUTS.Yes && upperInput !== INPUTS.No) {
      throw new Error(ERROR_MESSAGES.InvalidYn);
    }
  }
}

export default InputValidator;
