class ProductInventory {
  #productRepository;
  #inventory;

  constructor(productRepository) {
    this.#productRepository = productRepository;
    this.#inventory = new Map();
    this.initializeStock();
  }

  initializeStock() {
    const products = this.#productRepository.loadProducts();
    products.forEach((product) => {
      const key = this.#createInventoryKey(product.name, product.promotion);
      this.#inventory.set(key, product.quantity);
    });
  }

  #createInventoryKey(name, promotion) {
    return promotion ? `${name}_promotion` : `${name}_normal`;
  }

  decreaseStock(items, usePromotion = false) {
    items.forEach((item) => {
      const { name, quantity } = item;
      const key = this.#createInventoryKey(name, usePromotion);

      const currentStock = this.#inventory.get(key);
      if (currentStock < quantity) {
        throw new Error("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다.");
      }

      this.#inventory.set(key, currentStock - quantity);
    });
  }

  getStock(name) {
    const normalKey = this.#createInventoryKey(name, false);
    const promotionKey = this.#createInventoryKey(name, true);

    return (
      (this.#inventory.get(normalKey) || 0) +
      (this.#inventory.get(promotionKey) || 0)
    );
  }

  getNormalStock(name) {
    const key = this.#createInventoryKey(name, false);
    return this.#inventory.get(key) || 0;
  }

  getPromotionStock(name) {
    const key = this.#createInventoryKey(name, true);
    return this.#inventory.get(key) || 0;
  }

  hasPromotionStock(name) {
    const products = this.#productRepository.loadProducts();
    return products.some(
      (product) =>
        product.name === name &&
        product.promotion &&
        this.getPromotionStock(name) > 0,
    );
  }

  getStockInfo(name) {
    const totalStock = this.getStock(name);
    return totalStock === 0 ? "재고 없음" : `${totalStock}개`;
  }

  updateStock() {
    this.initializeStock();
  }
}

export default ProductInventory;
