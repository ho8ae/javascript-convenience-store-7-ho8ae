import { ERROR_MESSAGES, NUMBERS } from '../constants/index.js';

class ProductInventory {
  #productRepository;
  #promotionRepository;
  #inventory;

  constructor(productRepository, promotionRepository) {
    this.#productRepository = productRepository;
    this.#promotionRepository = promotionRepository;
    this.#inventory = new Map();
    this.initializeStock();
  }

  initializeStock() {
    this.#inventory.clear();
    const products = this.#productRepository.getProducts();
    products.forEach((product) => {
      const key = this.#createInventoryKey(product.name, product.promotion);
      this.#inventory.set(key, product.quantity);
    });
  }

  updateStock() {
    this.initializeStock();
  }

  getStock(name) {
    return this.getTotalStock(name);
  }

  decreaseStock(items) {
    items.forEach((item) => {
      const totalStock = this.getTotalStock(item.name);
      if (item.quantity > totalStock) {
        throw new Error(ERROR_MESSAGES.ExceededStock);
      }

      const promoKey = this.#createInventoryKey(item.name, true);
      const normalKey = this.#createInventoryKey(item.name, false);

      let promoStock = this.#inventory.get(promoKey) || NUMBERS.Zero;
      let normalStock = this.#inventory.get(normalKey) || NUMBERS.Zero;
      let remainingQuantity = item.quantity;

      if (promoStock > NUMBERS.Zero) {
        const quantityFromPromo = Math.min(remainingQuantity, promoStock);
        promoStock -= quantityFromPromo;
        remainingQuantity -= quantityFromPromo;
        this.#productRepository.updateStock(item.name, quantityFromPromo, true);
      }

      if (remainingQuantity > NUMBERS.Zero) {
        if (normalStock >= remainingQuantity) {
          normalStock -= remainingQuantity;
          this.#productRepository.updateStock(item.name, remainingQuantity, false);
        } else {
          throw new Error(ERROR_MESSAGES.ExceededStock);
        }
      }

      this.#inventory.set(promoKey, promoStock);
      this.#inventory.set(normalKey, normalStock);
    });
  }

  #createInventoryKey(name, promotion) {
    const suffix = this.#getInventorySuffix(promotion);
    return `${name}${suffix}`;
  }

  #getInventorySuffix(promotion) {
    if (promotion) {
      return "_promo";
    }
    return "_normal";
  }

  getTotalStock(name) {
    return this.getPromotionStock(name) + this.getNormalStock(name);
  }

  getPromotionStock(name) {
    return this.#inventory.get(this.#createInventoryKey(name, true)) || NUMBERS.Zero;
  }

  getNormalStock(name) {
    return this.#inventory.get(this.#createInventoryKey(name, false)) || NUMBERS.Zero;
  }
}

export default ProductInventory;