class MembershipDiscount {
  #DISCOUNT_RATE = 0.3;
  #MAX_DISCOUNT = 8000;

  calculateDiscount(amount, isMembershipApplied = true) {
    if (!isMembershipApplied || amount <= 0) {
      return 0;
    }

    return Math.floor(
      Math.min(amount * this.#DISCOUNT_RATE, this.#MAX_DISCOUNT),
    );
  }
}

export default MembershipDiscount;
