import { MissionUtils } from "@woowacourse/mission-utils";

class PromotionDiscount {
  #productRepository;
  #promotionRepository;

  constructor(productRepository, promotionRepository) {
    this.#productRepository = productRepository;
    this.#promotionRepository = promotionRepository;
  }

  calculatePromotion(items) {
    const result = {
      freeItems: [],
      discount: 0,
      promoQuantities: new Map(),
      normalQuantities: new Map(),
    };

    items.forEach((item) => {
      const promoProduct = this.#productRepository.findProductWithPromotion(
        item.name,
      );
      const promotion = promoProduct
        ? this.#promotionRepository.findPromotion(promoProduct.promotion)
        : null;

      if (!promoProduct || !promotion || !this.isValidPromotion(promotion)) {
        result.normalQuantities.set(item.name, item.quantity);
        return;
      }

      const { promoQuantity, normalQuantity, freeQuantity } =
        this.calculateNPlusK(
          item.quantity,
          promoProduct.quantity,
          promotion.buy, // N
          promotion.get, // K
        );

      if (promoQuantity > 0) {
        result.promoQuantities.set(item.name, promoQuantity + freeQuantity);
        result.freeItems.push({ name: item.name, quantity: freeQuantity });
        result.discount += promoProduct.price * freeQuantity;
      }

      if (normalQuantity > 0) {
        result.normalQuantities.set(item.name, normalQuantity);
      }
    });

    return result;
  }
  calculateNPlusK(orderQuantity, promoStock, n, k) {
    const maxSetsFromStock = Math.floor(promoStock / n);
    const maxSetsFromOrder = Math.floor(orderQuantity / (n + k));
    const completeSets = Math.min(maxSetsFromStock, maxSetsFromOrder, 2);

    const promoQuantity = completeSets * n;
    const freeQuantity = completeSets * k;

    const remainingQuantity = orderQuantity - (promoQuantity + freeQuantity);

    return {
      promoQuantity: promoQuantity,
      normalQuantity: Math.max(remainingQuantity, 0),
      freeQuantity: freeQuantity,
    };
  }

  isValidPromotion(promotion) {
    const currentDate = MissionUtils.DateTimes.now();
    return (
      currentDate >= new Date(promotion.startDate) &&
      currentDate <= new Date(promotion.endDate)
    );
  }

  parseInput(input) {
    if (Array.isArray(input)) return input;

    const matches = input.match(/\[([^\]]+)\]/g) || [];
    return matches.map((match) => {
      const [name, quantity] = match
        .slice(1, -1)
        .split("-")
        .map((s) => s.trim());
      return {
        name,
        quantity: parseInt(quantity),
      };
    });
  }

  calculateNonPromotionQuantity(item, product, promotion) {
    if (!product || !promotion) return item.quantity;

    const setSize = promotion.buy + promotion.get;
    const maxSets = Math.floor(product.quantity / setSize);
    const maxPromoQuantity = maxSets * promotion.buy;

    return Math.max(0, item.quantity - maxPromoQuantity);
  }
}

export default PromotionDiscount;
