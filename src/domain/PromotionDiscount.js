import { MissionUtils } from "@woowacourse/mission-utils";

class PromotionDiscount {
    #productRepository;
    #promotionRepository;

    constructor(productRepository, promotionRepository) {
        this.#productRepository = productRepository;
        this.#promotionRepository = promotionRepository;
    }

    calculatePromotion(input) {
        const purchaseItems = this.parseInput(input);
        const result = {
            freeItems: [],
            discount: 0
        };

        purchaseItems.forEach(item => {
            const promotionResult = this.calculateItemPromotion(item);
            if (promotionResult.freeQuantity > 0) {
                result.freeItems.push({
                    name: item.name,
                    quantity: promotionResult.freeQuantity
                });
                result.discount += promotionResult.discount;
            }
        });

        return result;
    }

    calculateItemPromotion(item) {
        const product = this.#productRepository.findProductWithPromotion(item.name);
        if (!product || !product.promotion) {
            return { freeQuantity: 0, discount: 0 };
        }

        const promotion = this.#promotionRepository.findPromotion(product.promotion);
        if (!promotion || !this.isValidPromotion(promotion)) {
            return { freeQuantity: 0, discount: 0 };
        }

        return this.applyPromotion(item, product, promotion);
    }

    isValidPromotion(promotion) {
        const currentDate = MissionUtils.DateTimes.now();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        
        return currentDate >= startDate && currentDate <= endDate;
    }

    applyPromotion(item, product, promotion) {
        const sets = Math.floor(item.quantity / promotion.buy);
        if (sets === 0) return { freeQuantity: 0, discount: 0 };

        const freeQuantity = promotion.get;  // 각 세트당 1개씩만 증정
        const discount = freeQuantity * product.price;

        return { freeQuantity, discount };
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
}

export default PromotionDiscount;