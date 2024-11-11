import InputView from "../view/InputView.js";
import OutputView from "../view/OutputView.js";
import ProductRepository from "../utils/repository/ProductRepository.js";
import PromotionRepository from "../utils/repository/PromotionRepository.js";
import PromotionDiscount from "../domain/PromotionDiscount.js";
import MembershipDiscount from "../domain/MembershipDiscount.js";
import Receipt from "../domain/Receipt.js";
import InputValidator from "../utils/InputValidator.js";
import ProductInventory from "../domain/ProductInventory.js";
import {
  PROMOTION,
  INPUTS,
  NUMBERS,
  STRING_PATTERNS,
} from "../constants/index.js";

class ConvenienceController {
  constructor() {
    this.productRepository = new ProductRepository();
    this.promotionRepository = new PromotionRepository();
    this.promotionDiscount = new PromotionDiscount(
      this.productRepository,
      this.promotionRepository,
    );
    this.membershipDiscount = new MembershipDiscount();
    this.receipt = new Receipt(this.productRepository);
    this.productInventory = new ProductInventory(
      this.productRepository,
      this.promotionRepository,
    );
  }

  async start() {
    this.productInventory.initializeStock();
    await this.showProducts();
    await this.processPurchase();
  }

  async showProducts() {
    const products = this.productRepository.getProducts();
    OutputView.printProducts(products);
  }

  async processPurchase() {
    try {
      const items = await this.processInitialPurchase();
      await this.processPromotions(items);

      const membershipApplied = await this.retryUntilValidMembership();
      const receiptData = await this.calculatePurchaseData(
        items,
        membershipApplied,
      );
      await this.handleStockAndReceipt(items, receiptData);

      return await this.handleAdditionalPurchase();
    } catch (error) {
      return this.handlePurchaseError(error);
    }
  }

  async calculatePurchaseData(items, membershipApplied) {
    const promotionResult = this.promotionDiscount.calculatePromotion(items);
    const { totalAmount } = this.receipt.calculatePurchase(items);
    const amountAfterPromotion = totalAmount - promotionResult.discount;
    const membershipDiscount = await this.calculateMembershipDiscount(
      amountAfterPromotion,
      membershipApplied,
    );

    return {
      promotionResult,
      membershipDiscount,
    };
  }

  async processInitialPurchase() {
    const purchaseInput = await this.getPurchaseInput();
    OutputView.print(STRING_PATTERNS.Empty);
    return InputValidator.parseInput(purchaseInput);
  }

  async processPromotions(items) {
    for (const item of items) {
      await this.processPromotionForItem(item);
    }
  }

  async processPromotionForItem(item) {
    const promoProduct = this.productRepository.findProductWithPromotion(
      item.name,
    );

    if (!this.isValidPromoProduct(promoProduct)) {
      return;
    }

    const promotion = this.promotionRepository.findPromotion(
      promoProduct.promotion,
    );
    if (!this.isValidPromotion(promotion)) {
      return;
    }

    if (promotion.buy === item.quantity) {
      await this.handlePromotionOffer(item, promoProduct, promotion);
    } else {
      await this.processPromotionItem(item, promoProduct, promotion);
    }
  }

  async handlePromotionOffer(item, promoProduct, promotion) {
    while (true) {
      try {
        const answer = await InputView.readPromotionAddQuestion(item.name);
        InputValidator.validateMembershipInput(answer);
        OutputView.printNewLine();
  
        if (answer.toUpperCase() === INPUTS.Yes) {
          // buy와 get이 둘 다 1인 경우 (1+1)
          if (promotion.buy === NUMBERS.One && promotion.get === NUMBERS.One) {
            item.quantity = NUMBERS.One + NUMBERS.One;  // 2개
            item.freeQuantity = NUMBERS.One;  // 1개 증정
            item.discount = promoProduct.price;  // 1개 가격만큼 할인
            item.suggestedPurchase = true;
            item.originQuantity = NUMBERS.One + NUMBERS.One;  // 원래 수량도 2개로
          } else {
            // 2+1, 3+1 등 다른 프로모션
            const result = this.promotionDiscount.calculateNPlusK(
              item.quantity,
              promoProduct.quantity,
              promotion.buy,
              promotion.get,
              promoProduct.promotion
            );
            item.quantity = result.totalQuantity;
            item.freeQuantity = result.freeQuantity;
            item.discount = result.freeQuantity * promoProduct.price;
            item.suggestedPurchase = true;
            item.originQuantity = result.totalQuantity;
          }
        } else {
          item.freeQuantity = NUMBERS.Zero;
          item.discount = NUMBERS.Zero;
        }
        return item;
      } catch (error) {
        OutputView.print(error.message);
      }
    }
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
      totalQuantity: quantity, // 전체 수량 유지
      needsConfirmation: remainingQuantity >= buyCount,
      nonPromoQuantity: remainingQuantity,
      originQuantity: quantity, // 원래 수량 저장
    };
  }

  isValidPromoProduct(promoProduct) {
    return (
      promoProduct !== null &&
      promoProduct !== undefined &&
      promoProduct.quantity > 0
    );
  }

  isValidPromotion(promotion) {
    return promotion && this.promotionDiscount.isValidPromotion(promotion);
  }

  async processPromotionItem(item, promoProduct, promotion) {
    if (this.isOneItemPromotion(promoProduct, item)) {
      return await this.handleOneItemPromotion(item, promoProduct, promotion);
    }
    return await this.handleNormalPromotion(item, promoProduct, promotion);
  }

  isOneItemPromotion(promoProduct, item) {
    return (
      (promoProduct.promotion === PROMOTION.MdRecommendation ||
        promoProduct.promotion === PROMOTION.FlashSale) &&
      item.quantity === NUMBERS.One
    );
  }

  async handleOneItemPromotion(item, promoProduct, promotion) {
    while (true) {
      try {
        const answer = await InputView.readPromotionAddQuestion(item.name);
        InputValidator.validateMembershipInput(answer);
        OutputView.printNewLine();

        if (answer.toUpperCase() === INPUTS.Yes) {
          const result = this.promotionDiscount.calculateNPlusK(
            item.quantity,
            promoProduct.quantity,
            promotion.buy,
            promotion.get,
            promoProduct.promotion,
          );
          item.quantity = result.promoQuantity + result.normalQuantity;
          item.freeQuantity = result.freeQuantity;
          item.discount = result.freeQuantity * promoProduct.price;
        } else {
          item.freeQuantity = 0;
          item.discount = 0;
        }
        return item;
      } catch (error) {
        OutputView.print(error.message);
      }
    }
  }

  async handleNormalPromotion(item, promoProduct, promotion) {
    const result = this.promotionDiscount.calculateNPlusK(
      item.quantity,
      promoProduct.quantity,
      promotion.buy,
      promotion.get,
      promoProduct.promotion,
    );

    if (result.needsConfirmation) {
      item.suggestedPurchase = false; // 일반 구매
      return await this.handlePromotionConfirmation(
        item,
        promoProduct,
        promotion,
        result,
      );
    }
    Object.assign(item, result);
    return item;
  }

  async handlePromotionConfirmation(item, promoProduct, promotion, result) {
    while (true) {
      try {
        const answer = await InputView.readPromotionWarning(
          item.name,
          result.nonPromoQuantity,
        );
        InputValidator.validateMembershipInput(answer);

        if (answer.toUpperCase() === INPUTS.Yes) {
          Object.assign(item, result);
          item.suggestedPurchase = true; // Y를 선택한 경우 전체 수량으로 처리
          return item;
        }

        return this.adjustPromotionQuantity(
          item,
          promoProduct,
          promotion,
          result,
        );
      } catch (error) {
        OutputView.print(error.message);
      }
    }
  }

  adjustPromotionQuantity(item, promoProduct, promotion, result) {
    item.quantity -= result.nonPromoQuantity;
    const newResult = this.promotionDiscount.calculateNPlusK(
      item.quantity,
      promoProduct.quantity,
      promotion.buy,
      promotion.get,
      promoProduct.promotion,
    );
    Object.assign(item, newResult);
    return item;
  }

  async retryUntilValidMembership() {
    while (true) {
      try {
        return await this.getMembershipInput();
      } catch (error) {
        OutputView.print(error.message);
      }
    }
  }

  async handleStockAndReceipt(items, { promotionResult, membershipDiscount }) {
    const purchaseItems = items.map((item) => {
      if (item.suggestedPurchase) {
        return {
          ...item,
          quantity: item.originQuantity || item.quantity, // 원래 수량 사용
        };
      }

      return {
        ...item,
        quantity: item.quantity - (item.freeQuantity || 0),
      };
    });

    const receipt = this.receipt.generateReceipt(
      purchaseItems,
      promotionResult.freeItems,
      promotionResult.discount,
      membershipDiscount,
    );

    this.productInventory.decreaseStock(items);
    OutputView.printReceipt(receipt);
  }

  async getPurchaseInput() {
    const input = await InputView.readPurchaseInput();
    InputValidator.validatePurchaseFormat(input);
    InputValidator.validateProduct(input, this.productRepository);
    InputValidator.validateStock(input, this.productRepository);
    return input;
  }

  async getMembershipInput() {
    const input = await InputView.readMembershipInput();
    InputValidator.validateMembershipInput(input);
    OutputView.printNewLine();
    return input.toUpperCase() === INPUTS.Yes;
  }

  async calculateMembershipDiscount(amountAfterPromotion, membershipApplied) {
    if (!membershipApplied) {
      return NUMBERS.Zero;
    }
    return this.membershipDiscount.calculateDiscountAmount(
      amountAfterPromotion,
    );
  }

  async handleAdditionalPurchase() {
    const continueOrder = await this.checkAdditionalPurchase();
    if (continueOrder) {
      OutputView.print(STRING_PATTERNS.Empty);
      await this.showProducts();
      return this.processPurchase();
    }
  }

  async checkAdditionalPurchase() {
    while (true) {
      try {
        const input = await InputView.readAdditionalPurchaseInput();
        InputValidator.validateMembershipInput(input);
        return input === INPUTS.Yes;
      } catch (error) {
        OutputView.print(error.message);
      }
    }
  }

  handlePurchaseError(error) {
    if (error.message === STRING_PATTERNS.NoInput) {
      return;
    }
    OutputView.print(error.message);
    return this.processPurchase();
  }
}

export default ConvenienceController;
