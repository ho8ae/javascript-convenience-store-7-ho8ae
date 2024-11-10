class MembershipDiscount {
  #DISCOUNT_RATE = 0.3;
  #MAX_DISCOUNT = 8000;

  calculateDiscountAmount(amount) {
    if (!amount) return 0;
    
    // 할인 금액 계산 (30%)
    const rawDiscount = amount * this.#DISCOUNT_RATE;
    
    // 천 단위로 내림 (Floor to thousands)
    const discountInThousands = Math.floor(rawDiscount / 1000) * 1000;
    
    // 최대 할인 금액(8000원) 제한 적용
    return Math.min(discountInThousands, this.#MAX_DISCOUNT);
  }
}

export default MembershipDiscount;