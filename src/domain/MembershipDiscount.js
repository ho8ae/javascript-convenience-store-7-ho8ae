class MembershipDiscount {
  #DISCOUNT_RATE = 0.3;
  #MAX_DISCOUNT = 8000;

  calculateDiscountAmount(totalAmount, promotionDiscount) {
    // 전체 금액에서 프로모션 할인을 뺀 후 멤버십 할인 적용
    const amountAfterPromotion = totalAmount - promotionDiscount;

    // 멤버십 할인을 적용할 수 있는지 확인
    if (amountAfterPromotion <= 0) return 0;

    // 멤버십 할인 금액 계산 (1000원 단위로 내림 처리)
    const discountBeforeRounding = amountAfterPromotion * this.#DISCOUNT_RATE;
    const roundedDiscount = Math.floor(discountBeforeRounding / 1000) * 1000;

    // 최대 할인 한도를 적용
    return Math.min(roundedDiscount, this.#MAX_DISCOUNT);
  }
}

export default MembershipDiscount;