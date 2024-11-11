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
      const purchaseInput = await this.#getPurchaseInput();
      OutputView.print(STRING_PATTERNS.Empty);
      const items = InputValidator.parseInput(purchaseInput);

      for (const item of items) {
        const promoProduct = this.#productRepository.findProductWithPromotion(
          item.name,
        );
        const promotion = promoProduct
          ? this.#promotionRepository.findPromotion(promoProduct.promotion)
          : null;

        if (promotion && this.#promotionDiscount.isValidPromotion(promotion)) {
          if (
            (promoProduct.promotion === PROMOTION.MdRecommendation ||
              promoProduct.promotion === PROMOTION.FlashSale) &&
            item.quantity === NUMBERS.One
          ) {
            const answer = await InputView.readPromotionAddQuestion(item.name);
            OutputView.print(STRING_PATTERNS.Empty); // 프로모션 추가 질문 답변 후 줄바꿈
            if (answer.toUpperCase() === INPUTS.Yes) {
              item.quantity = 2; // 총 2개로 수정 (1개 구매 + 1개 증정)
              const result = this.#promotionDiscount.calculateNPlusK(
                item.quantity,
                promoProduct.quantity,
                promotion.buy,
                promotion.get,
                promoProduct.promotion,
              );
              Object.assign(item, result);
            } else {
              item.quantity = NUMBERS.One;
              item.promoQuantity = NUMBERS.One;
              item.normalQuantity = NUMBERS.Zero;
              item.freeQuantity = NUMBERS.Zero;
            }
          } else {
            const result = this.#promotionDiscount.calculateNPlusK(
              item.quantity,
              promoProduct.quantity,
              promotion.buy,
              promotion.get,
              promoProduct.promotion,
            );

            if (result.needsConfirmation) {
              const answer = await InputView.readPromotionWarning(
                item.name,
                result.nonPromoQuantity,
              );
              OutputView.print(STRING_PATTERNS.Empty); // 프로모션 경고 답변 후 줄바꿈

              if (answer.toUpperCase() !== INPUTS.Yes) {
                item.quantity -= result.nonPromoQuantity;
                const newResult = this.#promotionDiscount.calculateNPlusK(
                  item.quantity,
                  promoProduct.quantity,
                  promotion.buy,
                  promotion.get,
                  promoProduct.promotion,
                );
                Object.assign(item, newResult);
              } else {
                Object.assign(item, result);
              }
            } else {
              Object.assign(item, result);
            }
          }
        }
      }

      const membershipApplied = await this.#getMembershipInput();

      const promotionResult = this.#promotionDiscount.calculatePromotion(items);
      const { totalAmount } = this.#receipt.calculatePurchase(items);
      const amountAfterPromotion = totalAmount - promotionResult.discount;
      const membershipDiscount = membershipApplied
        ? this.#membershipDiscount.calculateDiscountAmount(amountAfterPromotion)
        : NUMBERS.Zero;

      const receipt = this.#receipt.generateReceipt(
        items,
        promotionResult.freeItems,
        promotionResult.discount,
        membershipDiscount,
      );

      this.#productInventory.decreaseStock(items);
      OutputView.printReceipt(receipt);

      const continueOrder = await this.#checkAdditionalPurchase();
      if (continueOrder) {
        OutputView.print(STRING_PATTERNS.Empty); // 추가 구매 'Y' 입력 후 줄바꿈 추가
        await this.#showProducts();
        return this.#processPurchase();
      }
    } catch (error) {
      if (error.message === STRING_PATTERNS.NoInput) {
        return;
      }
      OutputView.print(error.message);
      return this.#processPurchase();
    }
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
    OutputView.print(STRING_PATTERNS.Empty); // 멤버십 입력 후 빈 줄 추가
    return input.toUpperCase() === INPUTS.Yes;
  }

  async #checkAdditionalPurchase() {
    const input = await InputView.readAdditionalPurchaseInput();
    const continueOrder = input.toUpperCase() === INPUTS.Yes;

    return continueOrder;
  }
}

export default ConvenienceController;
