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

  decreaseStock(items) {
    items.forEach((item) => {
      const promoKey = this.#createInventoryKey(item.name, true);
      const normalKey = this.#createInventoryKey(item.name, false);

      let promoStock = this.#inventory.get(promoKey) || 0;
      let normalStock = this.#inventory.get(normalKey) || 0;

      if (item.quantity > promoStock + normalStock) {
        throw new Error("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다.");
      }

      let remainingQuantity = item.quantity;

      // 프로모션 재고부터 차감
      if (promoStock > 0) {
        const promoDecrease = Math.min(promoStock, remainingQuantity);
        this.#inventory.set(promoKey, promoStock - promoDecrease);
        remainingQuantity -= promoDecrease;
      }

      // 일반 재고 차감
      if (remainingQuantity > 0) {
        this.#inventory.set(normalKey, normalStock - remainingQuantity);
      }
    });
  }

  #createInventoryKey(name, promotion) {
    return `${name}${promotion ? "_promo" : "_normal"}`;
  }

  getStock(name) {
    return (
      (this.getPromotionStock(name) || 0) + (this.getNormalStock(name) || 0)
    );
  }

  getPromotionStock(name) {
    return this.#inventory.get(this.#createInventoryKey(name, true)) || 0;
  }

  getNormalStock(name) {
    return this.#inventory.get(this.#createInventoryKey(name, false)) || 0;
  }

  updateStock() {
    this.initializeStock();
  }
}

export default ProductInventory;
