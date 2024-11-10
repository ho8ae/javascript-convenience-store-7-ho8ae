import Product from "./Product.js";

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
    const updatedProducts = this.#productRepository
      .getProducts()
      .map((product) => {
        const item = items.find((i) => i.name === product.name);
        if (!item) return product;

        const remainingQuantity = Math.max(0, product.quantity - item.quantity);
        return new Product(
          product.name,
          product.price,
          remainingQuantity,
          product.promotion,
        );
      });

    this.#productRepository.updateProducts(updatedProducts);
    this.initializeStock();
  }

  #decreaseSpecificStock(name, quantity, isPromotion) {
    const key = this.#createInventoryKey(name, isPromotion);
    const currentStock = this.#inventory.get(key) || 0;
    this.#inventory.set(key, Math.max(0, currentStock - quantity));
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
