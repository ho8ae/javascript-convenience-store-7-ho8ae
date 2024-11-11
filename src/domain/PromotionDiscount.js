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
    // 재고가 충분해야만 프로모션이 가능하도록 조건 추가
    if (
      this.#isOneToOnePromotion(promotionName, quantity) &&
      stockQuantity >= quantity + NUMBERS.One // 재고가 충분한 경우에만 프로모션 적용
    ) {
      return this.#getOneToOneResult(stockQuantity);
    }

    return this.#getNormalPromotionResult(
      quantity,
      stockQuantity,
      buyCount,
      getCount
    );
  }

  #isOneToOnePromotion(promotionName, quantity) {
    return (
      (promotionName === PROMOTION.MdRecommendation ||
        promotionName === PROMOTION.FlashSale) &&
      quantity === NUMBERS.One
    );
  }

  #getOneToOneResult(stockQuantity) {
    // 재고가 1개 이상 있어야 프로모션을 진행할 수 있음
    if (stockQuantity <= NUMBERS.One) {
      return {
        shouldSuggestMore: false,
        promoQuantity: NUMBERS.Zero,
        normalQuantity: NUMBERS.One,
        freeQuantity: NUMBERS.Zero,
        totalQuantity: NUMBERS.One,
      };
    }

    return {
      shouldSuggestMore: true,
      suggestQuantity: NUMBERS.One,
      promoQuantity: NUMBERS.One,
      normalQuantity: NUMBERS.Zero,
      freeQuantity: NUMBERS.One,
      totalQuantity: NUMBERS.One + NUMBERS.One,
    };
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
      product.promotion
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
