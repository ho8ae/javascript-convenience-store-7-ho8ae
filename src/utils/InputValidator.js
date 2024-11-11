import { ERROR_MESSAGES, STRING_PATTERNS, NUMBERS,INPUTS } from '../constants/index.js';

class InputValidator {
  static isValidPurchaseFormat(input) {
    const items = input.split(STRING_PATTERNS.Comma);

    return items.every((item) => {
      const trimmedItem = item.trim();
      return STRING_PATTERNS.ProductInputRegex.test(trimmedItem);
    });
  }

  static validatePurchaseFormat(input) {
    if (!this.isValidPurchaseFormat(input)) {
      throw new Error(ERROR_MESSAGES.InvalidFormat);
    }
  }

  static parseInput(input) {
    return input.split(STRING_PATTERNS.Comma).map((item) => {
      const trimmedItem = item.trim();
      const firstHyphenIndex = trimmedItem.indexOf(STRING_PATTERNS.Hyphen);
      const lastHyphenIndex = trimmedItem.lastIndexOf(STRING_PATTERNS.Hyphen);

      if (firstHyphenIndex !== lastHyphenIndex) {
        throw new Error(ERROR_MESSAGES.InvalidInput);
      }

      const matches = trimmedItem.match(STRING_PATTERNS.ProductInputRegex);

      if (!matches) {
        throw new Error(ERROR_MESSAGES.InvalidFormat);
      }

      const quantity = Number(matches[NUMBERS.SecondMatch]);
      if (quantity <= NUMBERS.Zero || !Number.isInteger(quantity)) {
        throw new Error(ERROR_MESSAGES.InvalidInput);
      }

      return {
        name: matches[NUMBERS.FirstMatch].trim(),
        quantity,
      };
    });
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

    products.forEach(({ name }) => {
      if (!productRepository.hasProduct(name)) {
        throw new Error(ERROR_MESSAGES.InvalidProduct);
      }
    });
  }

  static validateStock(input, productRepository) {
    const products = this.parseInput(input);

    products.forEach(({ name, quantity }) => {
      const totalStock = productRepository.getTotalStock(name);
      if (quantity > totalStock) {
        throw new Error(ERROR_MESSAGES.ExceededStock);
      }
    });
  }

  static validateMembershipInput(input) {
    const upperInput = input?.toUpperCase();
    if (upperInput !== INPUTS.Yes && upperInput !== INPUTS.No) {
      throw new Error(ERROR_MESSAGES.InvalidYn);
    }
  }
}
export default InputValidator;