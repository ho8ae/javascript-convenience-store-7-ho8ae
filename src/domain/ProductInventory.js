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
      this.#validateStock(item);
      this.#processStockDecrease(item);
    });
  }

  #validateStock(item) {
    const totalStock = this.getTotalStock(item.name);
    if (item.quantity > totalStock) {
      throw new Error(ERROR_MESSAGES.ExceededStock);
    }
  }

  #processStockDecrease(item) {
    const promoKey = this.#createInventoryKey(item.name, true);
    const normalKey = this.#createInventoryKey(item.name, false);

    let promoStock = this.#inventory.get(promoKey) || NUMBERS.Zero;
    let normalStock = this.#inventory.get(normalKey) || NUMBERS.Zero;
    let remainingQuantity = item.quantity;

    const { updatedPromoStock, updatedRemainingQuantity } = this.#decreasePromoStock(
      item,
      promoStock,
      remainingQuantity
    );

    if (updatedRemainingQuantity > NUMBERS.Zero) {
      normalStock = this.#decreaseNormalStock(item, normalStock, updatedRemainingQuantity);
    }

    this.#updateInventory(promoKey, normalKey, updatedPromoStock, normalStock);
  }

  #decreasePromoStock(item, promoStock, remainingQuantity) {
    if (promoStock <= NUMBERS.Zero) {
      return { updatedPromoStock: promoStock, updatedRemainingQuantity: remainingQuantity };
    }

    const quantityFromPromo = Math.min(remainingQuantity, promoStock);
    const updatedPromoStock = promoStock - quantityFromPromo;
    const updatedRemainingQuantity = remainingQuantity - quantityFromPromo;

    this.#productRepository.updateStock(item.name, quantityFromPromo, true);
    return { updatedPromoStock, updatedRemainingQuantity };
  }

  #decreaseNormalStock(item, normalStock, remainingQuantity) {
    if (normalStock < remainingQuantity) {
      throw new Error(ERROR_MESSAGES.ExceededStock);
    }

    const updatedNormalStock = normalStock - remainingQuantity;
    this.#productRepository.updateStock(item.name, remainingQuantity, false);
    return updatedNormalStock;
  }

  #updateInventory(promoKey, normalKey, promoStock, normalStock) {
    this.#inventory.set(promoKey, promoStock);
    this.#inventory.set(normalKey, normalStock);
  }

  #createInventoryKey(name, promotion) {
    if (promotion) {
      return `${name}_promo`;
    }
    return `${name}_normal`;
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