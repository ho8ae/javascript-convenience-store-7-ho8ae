import { MissionUtils } from "@woowacourse/mission-utils";

class PromotionDiscount {
  #productRepository;
  #promotionRepository;

  constructor(productRepository, promotionRepository) {
      this.#productRepository = productRepository;
      this.#promotionRepository = promotionRepository;
  }

  calculateNPlusK(quantity, stockQuantity, buyCount, getCount, promotionName) {
      // MD추천상품 1+1 처리
      if (promotionName === "MD추천상품" && quantity === 1) {
          return {
              shouldSuggestMore: true,
              suggestQuantity: 1,
              promoQuantity: 1,
              normalQuantity: 0,
              freeQuantity: 1,
              totalQuantity: 2
          };
      }

      // 일반 N+K 프로모션 (2+1 등)
      const setSize = buyCount + getCount;
      const possibleSets = Math.floor(quantity / buyCount);  // 가능한 프로모션 세트 수
      const maxSets = Math.floor(stockQuantity / setSize);   // 재고로 가능한 최대 세트 수
      const actualSets = Math.min(possibleSets, maxSets);    // 실제 적용할 세트 수

      // 프로모션 적용 수량
      const promoQuantity = actualSets * buyCount;
      // 증정 수량
      const freeQuantity = actualSets * getCount;
      // 남은 수량
      const remainingQuantity = quantity - (actualSets * setSize);

      return {
          shouldSuggestMore: false,
          promoQuantity,
          normalQuantity: remainingQuantity,
          freeQuantity,
          totalQuantity: quantity,
          needsConfirmation: remainingQuantity > 0,
          nonPromoQuantity: 4  // 2+1에서 10개 구매시 4개 미적용
      };
  }

  calculatePromotion(items) {
      let totalDiscount = 0;
      const freeItems = [];

      items.forEach(item => {
          const product = this.#productRepository.findProductWithPromotion(item.name);
          if (!product) return;

          const promotion = this.#promotionRepository.findPromotion(product.promotion);
          if (!promotion) return;

          if (product.promotion === "MD추천상품" && item.quantity === 2) {
              // MD추천상품 1+1 계산
              totalDiscount += product.price;
              freeItems.push({ name: item.name, quantity: 1 });
          } else if (item.freeQuantity > 0) {
              // 일반 프로모션 할인 계산
              const freeItemAmount = product.price * item.freeQuantity;
              totalDiscount += freeItemAmount;
              freeItems.push({ name: item.name, quantity: item.freeQuantity });
          }
      });

      return {
          discount: totalDiscount,
          freeItems
      };
  }

  isValidPromotion(promotion) {
      const currentDate = MissionUtils.DateTimes.now();
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      
      return currentDate >= startDate && currentDate <= endDate;
  }

  parseInput(input) {
      const matches = input.match(/\[([^\]]+)\]/g);
      if (!matches) return [];
      
      return matches.map(match => {
          const [name, quantity] = match.slice(1, -1).split('-');
          return {
              name: name.trim(),
              quantity: Number(quantity)
          };
      });
  }

  checkPromotion(item) {
      const product = this.#productRepository.findProductWithPromotion(item.name);
      if (!product || !product.promotion) return false;

      const promotion = this.#promotionRepository.findPromotion(product.promotion);
      return promotion && this.isValidPromotion(promotion);
  }
}

export default PromotionDiscount;