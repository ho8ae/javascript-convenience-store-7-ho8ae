class PromotionDiscount {
  #productRepository;
  #promotionRepository;

  constructor(productRepository, promotionRepository) {
    this.#productRepository = productRepository;
    this.#promotionRepository = promotionRepository;
  }

  calculateNPlusK(quantity, promoStock, buyCount, getCount) {
    const setSize = buyCount + getCount;

    // 프로모션 재고로 만들 수 있는 최대 세트 수
    const maxPromoSets = Math.floor(promoStock / setSize);
    // 요청한 수량으로 만들 수 있는 세트 수
    const requestedSets = Math.floor(quantity / setSize);

    // 실제 적용할 수 있는 프로모션 세트 수
    const appliedSets = Math.min(maxPromoSets, requestedSets);

    // 프로모션으로 처리되는 수량
    const promoQuantity = appliedSets * setSize;
    // 프로모션 적용 후 남은 수량
    const normalQuantity = quantity - promoQuantity;
    // 증정되는 수량
    const freeQuantity = appliedSets * getCount;

    // 프로모션 미적용 수량이 있는지 확인
    const hasNormalQuantity = normalQuantity > 0;

    return {
      promoQuantity: appliedSets * buyCount,
      normalQuantity,
      freeQuantity,
      totalQuantity: quantity,
      needsConfirmation: hasNormalQuantity,
      nonPromoQuantity: normalQuantity,
    };
  }

  calculatePromotion(items) {
    let totalDiscount = 0;
    const freeItems = [];

    items.forEach((item) => {
      const product = this.#productRepository.findProductWithPromotion(
        item.name,
      );
      if (!product) return;

      const promotion = this.#promotionRepository.findPromotion(
        product.promotion,
      );
      if (!promotion) return;

      const promoStock =
        this.#productRepository.findProductWithPromotion(item.name)?.quantity ||
        0;
      const { promoQuantity, freeQuantity } = this.calculateNPlusK(
        item.quantity,
        promoStock,
        promotion.buy,
        promotion.get,
      );

      if (freeQuantity > 0) {
        const freeItemAmount = product.price * freeQuantity;
        totalDiscount += freeItemAmount;
        freeItems.push({ name: item.name, quantity: freeQuantity });
      }
    });

    return {
      discount: totalDiscount,
      freeItems,
    };
  }
}

export default PromotionDiscount;
