import InputView from "../view/InputView.js";
import OutputView from "../view/OutputView.js";
import ProductRepository from "../utils/repository/ProductRepository.js";
import PromotionRepository from "../utils/repository/PromotionRepository.js";
import PromotionDiscount from "../domain/PromotionDiscount.js";
import MembershipDiscount from "../domain/MembershipDiscount.js";
import Receipt from "../domain/Receipt.js";
import InputValidator from "../utils/InputValidator.js";
import ProductInventory from "../domain/ProductInventory.js";
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
      const items = InputValidator.parseInput(purchaseInput);

      for (const item of items) {
        const promoProduct = this.#productRepository.findProductWithPromotion(
          item.name,
        );
        const promotion = promoProduct
          ? this.#promotionRepository.findPromotion(promoProduct.promotion)
          : null;

        if (promotion) {
          const result = this.#promotionDiscount.calculateNPlusK(
            item.quantity,
            promoProduct.quantity,
            promotion.buy,
            promotion.get,
            promoProduct.promotion,
          );

          if (promoProduct.promotion === "MD추천상품" && item.quantity === 1) {
            const answer = await InputView.readPromotionAddQuestion(
              item.name,
              1,
            );
            if (answer.toUpperCase() === "Y") {
              item.quantity = 2; // 총 2개로 수정 (1개 구매 + 1개 증정)
              Object.assign(item, result);
            } else {
              item.quantity = 1; // 1개만 구매
              item.promoQuantity = 1;
              item.normalQuantity = 0;
              item.freeQuantity = 0;
            }
          } else if (result.needsConfirmation) {
            const answer = await InputView.readPromotionWarning(
              item.name,
              result.nonPromoQuantity,
            );
            if (answer.toUpperCase() !== "Y") {
              // 프로모션 적용 가능한 수량만 구매
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

      const membershipApplied = await this.#getMembershipInput();
      const promotionResult = this.#promotionDiscount.calculatePromotion(items);
      const { totalAmount } = this.#receipt.calculatePurchase(items);
      const amountAfterPromotion = totalAmount - promotionResult.discount;
      const membershipDiscount = membershipApplied
        ? this.#membershipDiscount.calculateDiscountAmount(amountAfterPromotion)
        : 0;

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
        await this.#showProducts();
        return this.#processPurchase();
      }
    } catch (error) {
      if (error.message === "NO INPUT") {
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
    InputValidator.validateMembershipInput(input);
    return input.toUpperCase() === "Y";
  }

  async #checkAdditionalPurchase() {
    const input = await InputView.readAdditionalPurchaseInput();
    InputValidator.validateMembershipInput(input);
    return input.toUpperCase() === "Y";
  }
}

export default ConvenienceController;
