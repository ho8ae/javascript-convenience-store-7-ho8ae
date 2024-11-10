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

  // 총 재고 조회 메서드 추가
  getStock(name) {
    return this.getTotalStock(name);
  }

  decreaseStock(items) {
    items.forEach((item) => {
      // 총 재고 확인
      const totalStock = this.getTotalStock(item.name);
      if (item.quantity > totalStock) {
        throw new Error("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다.");
      }

      const promoKey = this.#createInventoryKey(item.name, true);
      const normalKey = this.#createInventoryKey(item.name, false);

      let promoStock = this.#inventory.get(promoKey) || 0;
      let normalStock = this.#inventory.get(normalKey) || 0;
      let remainingQuantity = item.quantity;

      // 프로모션 재고 우선 사용
      if (promoStock > 0) {
        const quantityFromPromo = Math.min(remainingQuantity, promoStock);
        promoStock -= quantityFromPromo;
        remainingQuantity -= quantityFromPromo;
        this.#productRepository.updateStock(item.name, quantityFromPromo, true);
      }

      // 남은 수량은 일반 재고에서 차감
      if (remainingQuantity > 0) {
        if (normalStock >= remainingQuantity) {
          normalStock -= remainingQuantity;
          this.#productRepository.updateStock(item.name, remainingQuantity, false);
        } else {
          throw new Error("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다.");
        }
      }

      this.#inventory.set(promoKey, promoStock);
      this.#inventory.set(normalKey, normalStock);
    });
  }

  #createInventoryKey(name, promotion) {
    return `${name}${promotion ? "_promo" : "_normal"}`;
  }

  getTotalStock(name) {
    return this.getPromotionStock(name) + this.getNormalStock(name);
  }

  getPromotionStock(name) {
    return this.#inventory.get(this.#createInventoryKey(name, true)) || 0;
  }

  getNormalStock(name) {
    return this.#inventory.get(this.#createInventoryKey(name, false)) || 0;
  }
}

export default ProductInventory;