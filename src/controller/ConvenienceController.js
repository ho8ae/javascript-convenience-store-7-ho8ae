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
  STRING_PATTERNS 
} from '../constants/index.js';

class ConvenienceController {
  #productRepository;
  #promotionRepository;
  #promotionDiscount;
  #membershipDiscount;
  #receipt;
  #productInventory;

  constructor() {
    this.#productRepository = new ProductRepository();
    this.#promotionRepository = new PromotionRepository();
    this.#promotionDiscount = new PromotionDiscount(
      this.#productRepository,
      this.#promotionRepository,
    );
    this.#membershipDiscount = new MembershipDiscount();
    this.#receipt = new Receipt(this.#productRepository);
    this.#productInventory = new ProductInventory(
      this.#productRepository,
      this.#promotionRepository,
    );
  }

  async start() {
    this.#productInventory.initializeStock();
    await this.#showProducts();
    await this.#processPurchase();
  }

  async #showProducts() {
    const products = this.#productRepository.getProducts();
    OutputView.printProducts(products);
  }

  async #processPurchase() {
    try {
      const items = await this.#processInitialPurchase();
      await this.#processPromotions(items);
      
      const membershipApplied = await this.#retryUntilValidMembership();
      const receiptData = await this.#calculatePurchaseData(items, membershipApplied);
      await this.#handleStockAndReceipt(items, receiptData);
      
      return await this.#handleAdditionalPurchase();
    } catch (error) {
      return this.#handlePurchaseError(error);
    }
  }

  async #calculatePurchaseData(items, membershipApplied) {
    const promotionResult = this.#promotionDiscount.calculatePromotion(items);
    const { totalAmount } = this.#receipt.calculatePurchase(items);
    const amountAfterPromotion = totalAmount - promotionResult.discount;
    const membershipDiscount = await this.#calculateMembershipDiscount(
      amountAfterPromotion,
      membershipApplied
    );

    return {
      promotionResult,
      membershipDiscount
    };
  }

  async #processInitialPurchase() {
    const purchaseInput = await this.#getPurchaseInput();
    OutputView.print(STRING_PATTERNS.Empty);
    return InputValidator.parseInput(purchaseInput);
  }

  async #processPromotions(items) {
    for (const item of items) {
      await this.#processPromotionForItem(item);
    }
  }

  async #processPromotionForItem(item) {
    const promoProduct = this.#productRepository.findProductWithPromotion(item.name);
    if (!this.#isValidPromoProduct(promoProduct)) {
      return;
    }

    const promotion = this.#promotionRepository.findPromotion(promoProduct.promotion);
    if (!this.#isValidPromotion(promotion)) {
      return;
    }

    await this.#processPromotionItem(item, promoProduct, promotion);
  }

  #isValidPromoProduct(promoProduct) {
    return promoProduct !== null && promoProduct !== undefined;
  }

  #isValidPromotion(promotion) {
    return promotion && this.#promotionDiscount.isValidPromotion(promotion);
  }

  async #processPromotionItem(item, promoProduct, promotion) {
    if (this.#isOneItemPromotion(promoProduct, item)) {
      return await this.#handleOneItemPromotion(item, promoProduct, promotion);
    }
    return await this.#handleNormalPromotion(item, promoProduct, promotion);
  }

  #isOneItemPromotion(promoProduct, item) {
    return (promoProduct.promotion === PROMOTION.MdRecommendation || 
            promoProduct.promotion === PROMOTION.FlashSale) && 
           item.quantity === NUMBERS.One;
  }

  async #handleOneItemPromotion(item, promoProduct, promotion) {
    const answer = await InputView.readPromotionAddQuestion(item.name);
    OutputView.print(STRING_PATTERNS.Empty);
    return this.#processPromotionAnswer(answer, item, promoProduct, promotion);
  }

  #processPromotionAnswer(answer, item, promoProduct, promotion) {
    if (answer.toUpperCase() === INPUTS.Yes) {
      return this.#applyPromotion(item, promoProduct, promotion);
    }
    return this.#skipPromotion(item);
  }

  #applyPromotion(item, promoProduct, promotion) {
    item.quantity = NUMBERS.One + NUMBERS.One;
    const result = this.#promotionDiscount.calculateNPlusK(
      item.quantity,
      promoProduct.quantity,
      promotion.buy,
      promotion.get,
      promoProduct.promotion
    );
    Object.assign(item, result);
    return item;
  }

  #skipPromotion(item) {
    item.quantity = NUMBERS.One;
    item.promoQuantity = NUMBERS.One;
    item.normalQuantity = NUMBERS.Zero;
    item.freeQuantity = NUMBERS.Zero;
    return item;
  }

  async #handleNormalPromotion(item, promoProduct, promotion) {
    const result = this.#promotionDiscount.calculateNPlusK(
      item.quantity,
      promoProduct.quantity,
      promotion.buy,
      promotion.get,
      promoProduct.promotion
    );

    if (result.needsConfirmation) {
      return await this.#handlePromotionConfirmation(item, promoProduct, promotion, result);
    }
    Object.assign(item, result);
    return item;
  }

  async #handlePromotionConfirmation(item, promoProduct, promotion, result) {
    const answer = await InputView.readPromotionWarning(
      item.name,
      result.nonPromoQuantity
    );
    OutputView.print(STRING_PATTERNS.Empty);

    if (answer.toUpperCase() !== INPUTS.Yes) {
      return this.#adjustPromotionQuantity(item, promoProduct, promotion, result);
    }
    Object.assign(item, result);
    return item;
  }

  #adjustPromotionQuantity(item, promoProduct, promotion, result) {
    item.quantity -= result.nonPromoQuantity;
    const newResult = this.#promotionDiscount.calculateNPlusK(
      item.quantity,
      promoProduct.quantity,
      promotion.buy,
      promotion.get,
      promoProduct.promotion
    );
    Object.assign(item, newResult);
    return item;
  }

  async #retryUntilValidMembership() {
    while (true) {
      try {
        return await this.#getMembershipInput();
      } catch (error) {
        OutputView.print(error.message);
      }
    }
  }

  async #handleStockAndReceipt(items, { promotionResult, membershipDiscount }) {
    const receipt = this.#receipt.generateReceipt(
      items,
      promotionResult.freeItems,
      promotionResult.discount,
      membershipDiscount
    );

    this.#productInventory.decreaseStock(items);
    OutputView.printReceipt(receipt);
  }

  async #getPurchaseInput() {
    const input = await InputView.readPurchaseInput();
    InputValidator.validatePurchaseFormat(input);
    InputValidator.validateProduct(input, this.#productRepository);
    InputValidator.validateStock(input, this.#productRepository);
    return input;
  }

  async #getMembershipInput() {
    const input = await InputView.readMembershipInput();
    InputValidator.validateMembershipInput(input);
    OutputView.printNewLine(); 
    return input.toUpperCase() === INPUTS.Yes;
  }

  async #calculateMembershipDiscount(amountAfterPromotion, membershipApplied) {
    if (!membershipApplied) {
      return NUMBERS.Zero;
    }
    return this.#membershipDiscount.calculateDiscountAmount(amountAfterPromotion);
  }

  async #handleAdditionalPurchase() {
    const continueOrder = await this.#checkAdditionalPurchase();
    if (continueOrder) {
      OutputView.print(STRING_PATTERNS.Empty);
      await this.#showProducts();
      return this.#processPurchase();
    }
  }

  async #checkAdditionalPurchase() {
    const input = await InputView.readAdditionalPurchaseInput();
    InputValidator.validateMembershipInput(input);
    return input.toUpperCase() === INPUTS.Yes;
  }

  #handlePurchaseError(error) {
    if (error.message === STRING_PATTERNS.NoInput) {
      return;
    }
    OutputView.print(error.message);
    return this.#processPurchase();
  }
}

export default ConvenienceController;