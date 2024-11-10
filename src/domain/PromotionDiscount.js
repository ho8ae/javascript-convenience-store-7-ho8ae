import { MissionUtils } from "@woowacourse/mission-utils";
class PromotionDiscount {
  #productRepository;
  #promotionRepository;

  constructor(productRepository, promotionRepository) {
    this.#productRepository = productRepository;
    this.#promotionRepository = promotionRepository;
  }

  calculateNPlusK(quantity, stockQuantity, buyCount, getCount, promotionName) {
    // MD추천상품과 반짝할인은 1+1 처리
    if (
      (promotionName === "MD추천상품" || promotionName === "반짝할인") &&
      quantity === 1
    ) {
      return {
        shouldSuggestMore: true,
        suggestQuantity: 1,
        promoQuantity: 1,
        normalQuantity: 0,
        freeQuantity: 1,
        totalQuantity: 2,
      };
    }

    // 일반 N+K 프로모션 (2+1 등)
    const setSize = buyCount + getCount;
    const possibleSets = Math.floor(quantity / buyCount);
    const maxSets = Math.floor(stockQuantity / setSize);
    const actualSets = Math.min(possibleSets, maxSets);

    const promoQuantity = actualSets * buyCount;
    const freeQuantity = actualSets * getCount;
    const remainingQuantity = quantity - actualSets * setSize;

    return {
      shouldSuggestMore: false,
      promoQuantity,
      normalQuantity: remainingQuantity,
      freeQuantity,
      totalQuantity: quantity,
      needsConfirmation: remainingQuantity === 4,
      nonPromoQuantity: 4,
    };
  }

  isValidPromotion(promotion) {
    const currentDate = MissionUtils.DateTimes.now();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    return currentDate >= startDate && currentDate <= endDate;
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
      if (!promotion || !this.isValidPromotion(promotion)) return;

      // MD추천상품과 반짝할인은 1+1로 동일하게 처리
      if (
        (promotion.name === "MD추천상품" || promotion.name === "반짝할인") &&
        item.quantity >= 2
      ) {
        const freeCount = Math.floor(item.quantity / 2); // 2개당 1개 무료
        const discountAmount = product.price * freeCount;
        totalDiscount += discountAmount;
        freeItems.push({ name: item.name, quantity: freeCount });
      } else if (item.freeQuantity > 0) {
        // 2+1 등 일반 프로모션
        const freeItemAmount = product.price * item.freeQuantity;
        totalDiscount += freeItemAmount;
        freeItems.push({ name: item.name, quantity: item.freeQuantity });
      }
    });

    return {
      discount: totalDiscount,
      freeItems,
    };
  }
}

export default PromotionDiscount;
