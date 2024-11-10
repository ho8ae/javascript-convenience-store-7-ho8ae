class Receipt {
  #productRepository;

  constructor(productRepository) {
    this.#productRepository = productRepository;
  }

  calculatePurchase(items) {
    const purchaseItems = items.map(item => {
      const product = this.#productRepository.findProduct(item.name);
      const amount = product.price * item.quantity;

      return {
        name: item.name,
        quantity: item.quantity,
        amount,
        formattedAmount: this.#formatAmount(amount)
      };
    });

    const totalAmount = purchaseItems.reduce((sum, item) => sum + item.amount, 0);

    return {
      items: purchaseItems,
      totalAmount,
      formattedTotalAmount: this.#formatAmount(totalAmount)
    };
  }

  generateReceipt(items, freeItems, promotionDiscount, membershipDiscount) {
    const { items: purchaseItems, totalAmount } = this.calculatePurchase(items);
    const finalAmount = totalAmount - promotionDiscount - membershipDiscount;

    return {
      items: purchaseItems,
      freeItems,
      totalAmount,
      formattedTotalAmount: this.#formatAmount(totalAmount),
      promotionDiscount,
      formattedPromotionDiscount: this.#formatAmount(promotionDiscount),
      membershipDiscount,
      formattedMembershipDiscount: this.#formatAmount(membershipDiscount),
      finalAmount,
      formattedFinalAmount: this.#formatAmount(finalAmount)
    };
  }

  #formatAmount(amount) {
    return amount.toLocaleString();
  }
}

export default Receipt;