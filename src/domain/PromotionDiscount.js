import { MissionUtils } from "@woowacourse/mission-utils";
import { 
  PROMOTION, 
  NUMBERS,  
} from '../constants/index.js';

class PromotionDiscount {
  #productRepository;
  #promotionRepository;

  constructor(productRepository, promotionRepository) {
    this.#productRepository = productRepository;
    this.#promotionRepository = promotionRepository;
  }

  calculateNPlusK(quantity, stockQuantity, buyCount, getCount, promotionName) {
    if (
      (promotionName === PROMOTION.MdRecommendation || 
       promotionName === PROMOTION.FlashSale) &&
      quantity === NUMBERS.One
    ) {
      return {
        shouldSuggestMore: true,
        suggestQuantity: NUMBERS.One,
        promoQuantity: NUMBERS.One,
        normalQuantity: NUMBERS.Zero,
        freeQuantity: NUMBERS.One,
        totalQuantity: NUMBERS.One + NUMBERS.One,
      };
    }

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
      needsConfirmation: remainingQuantity === NUMBERS.TwoPlusOneRequiredItems * 2,
      nonPromoQuantity: NUMBERS.TwoPlusOneRequiredItems * 2,
    };
  }

  calculatePromotion(items) {
    let totalDiscount = NUMBERS.Zero;
    const freeItems = [];

    items.forEach((item) => {
      const product = this.#productRepository.findProductWithPromotion(item.name);
      if (!product) return;

      const promotion = this.#promotionRepository.findPromotion(product.promotion);
      if (!promotion || !this.isValidPromotion(promotion)) return;

      if (
        (promotion.name === PROMOTION.MdRecommendation || 
         promotion.name === PROMOTION.FlashSale) &&
        item.quantity >= NUMBERS.One + NUMBERS.One
      ) {
        const freeCount = Math.floor(item.quantity / NUMBERS.One + NUMBERS.One);
        const discountAmount = product.price * freeCount;
        totalDiscount += discountAmount;
        freeItems.push({ name: item.name, quantity: freeCount });
      } else if (item.freeQuantity > NUMBERS.Zero) {
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

  isValidPromotion(promotion) {
    const currentDate = MissionUtils.DateTimes.now();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    return currentDate >= startDate && currentDate <= endDate;
  }
}

export default PromotionDiscount;
