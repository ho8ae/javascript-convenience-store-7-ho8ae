import { MissionUtils } from "@woowacourse/mission-utils";
import { PROMOTION, NUMBERS } from "../constants/index.js";

class PromotionDiscount {
  #productRepository;
  #promotionRepository;

  constructor(productRepository, promotionRepository) {
    this.#productRepository = productRepository;
    this.#promotionRepository = promotionRepository;
  }
  calculateNPlusK(quantity, stockQuantity, buyCount, getCount, promotionName) {
    // MD추천상품/반짝할인 (1+1) 처리
    if (
      promotionName === PROMOTION.MdRecommendation ||
      promotionName === PROMOTION.FlashSale
    ) {
      return this.#handleOneToOnePromotion(quantity, stockQuantity);
    }

    // 일반 N+1 프로모션 (2+1 등) 처리
    return this.#handleNormalPromotion(
      quantity,
      stockQuantity,
      buyCount,
      getCount,
    );
  }

  #handleOneToOnePromotion(quantity, stockQuantity) {
    if (quantity === NUMBERS.One && stockQuantity >= NUMBERS.Two) {
      return {
        shouldSuggestMore: true,
        suggestQuantity: NUMBERS.One,
        promoQuantity: NUMBERS.One,
        normalQuantity: NUMBERS.Zero,
        freeQuantity: NUMBERS.One,
        totalQuantity: NUMBERS.Two,
      };
    }
    return this.#getNormalPromotionResult(
      quantity,
      stockQuantity,
      NUMBERS.One,
      NUMBERS.One,
    );
  }

  #handleNormalPromotion(quantity, stockQuantity, buyCount, getCount) {
    if (quantity === buyCount && stockQuantity >= quantity + getCount) {
      return {
        shouldSuggestMore: true,
        suggestQuantity: getCount,
        promoQuantity: buyCount,
        normalQuantity: NUMBERS.Zero,
        freeQuantity: getCount,
        totalQuantity: buyCount + getCount,
      };
    }
    return this.#getNormalPromotionResult(
      quantity,
      stockQuantity,
      buyCount,
      getCount,
    );
  }

  #getNormalPromotionResult(quantity, stockQuantity, buyCount, getCount) {
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
      needsConfirmation:
        remainingQuantity === NUMBERS.TwoPlusOneRequiredItems * 2,
      nonPromoQuantity: NUMBERS.TwoPlusOneRequiredItems * 2,
    };
  }

  isValidPromotion(promotion) {
    const currentDate = MissionUtils.DateTimes.now();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    return currentDate >= startDate && currentDate <= endDate;
  }

  calculatePromotion(items) {
    const result = {
      discount: NUMBERS.Zero,
      freeItems: [],
    };

    items.forEach((item) => {
      this.#processItemPromotion(item, result);
    });

    return result;
  }

  #processItemPromotion(item, result) {
    const product = this.#productRepository.findProductWithPromotion(item.name);
    if (!this.#isValidProduct(product)) {
      return;
    }

    const promotion = this.#promotionRepository.findPromotion(
      product.promotion,
    );
    if (!this.#isValidPromotionRule(promotion)) {
      return;
    }

    this.#applyPromotionDiscount(item, product, promotion, result);
  }

  #isValidProduct(product) {
    return product !== null && product !== undefined;
  }

  #isValidPromotionRule(promotion) {
    return promotion && this.isValidPromotion(promotion);
  }

  #applyPromotionDiscount(item, product, promotion, result) {
    if (this.#isSpecialPromotion(promotion, item, product)) {
      this.#applySpecialPromotion(item, product, result);
      return;
    }

    if (item.freeQuantity > NUMBERS.Zero) {
      this.#applyNormalPromotion(item, product, result);
    }
  }

  #isSpecialPromotion(promotion, item, product) {
    // 재고가 충분한지 추가로 확인
    return (
      (promotion.name === PROMOTION.MdRecommendation ||
        promotion.name === PROMOTION.FlashSale) &&
      item.quantity >= NUMBERS.One + NUMBERS.One &&
      product.quantity >= item.quantity + NUMBERS.One
    );
  }

  #applySpecialPromotion(item, product, result) {
    const freeCount = Math.floor(item.quantity / (NUMBERS.One + NUMBERS.One));
    const discountAmount = product.price * freeCount;

    result.discount += discountAmount;
    result.freeItems.push({ name: item.name, quantity: freeCount });
  }

  #applyNormalPromotion(item, product, result) {
    const freeItemAmount = product.price * item.freeQuantity;

    result.discount += freeItemAmount;
    result.freeItems.push({ name: item.name, quantity: item.freeQuantity });
  }
}

export default PromotionDiscount;
