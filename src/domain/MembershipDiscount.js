class MembershipDiscount {
  #DISCOUNT_RATE = 0.3;
  #MAX_DISCOUNT = 8000;

  calculateDiscountAmount(amountAfterPromotion) {
    if (!amountAfterPromotion) return 0;
    
    const discountAmount = Math.floor(amountAfterPromotion * this.#DISCOUNT_RATE);
    return Math.min(discountAmount, this.#MAX_DISCOUNT);
  }
}

export default MembershipDiscount;