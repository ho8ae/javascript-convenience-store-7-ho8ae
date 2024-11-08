class MembershipDiscount {
  #DISCOUNT_RATE = 0.3; // 30% 할인
  #MAX_DISCOUNT = 8000; // 최대 8,000원

  calculateDiscount(amount, isMembershipApplied = true) {
    if (!isMembershipApplied || amount <= 0) {
      return 0;
    }

    const discountAmount = Math.floor(amount * this.#DISCOUNT_RATE);
    return Math.min(discountAmount, this.#MAX_DISCOUNT);
  }
}

export default MembershipDiscount;
