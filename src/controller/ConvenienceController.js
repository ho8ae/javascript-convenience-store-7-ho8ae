import InputView from "../view/InputView.js";
import OutputView from "../view/OutputView.js";
import ProductRepository from "../utils/repository/ProductRepository.js";
import PromotionRepository from "../utils/repository/PromotionRepository.js";
import PromotionDiscount from "../domain/PromotionDiscount.js";
import MembershipDiscount from "../domain/MembershipDiscount.js";
import Receipt from "../domain/Receipt.js";
import InputValidator from "../utils/InputValidator.js";

class ConvenienceController {
  #productRepository;
  #promotionRepository;
  #promotionDiscount;
  #membershipDiscount;
  #receipt;

  constructor() {
    this.#productRepository = new ProductRepository();
    this.#promotionRepository = new PromotionRepository();
    this.#promotionDiscount = new PromotionDiscount(
      this.#productRepository,
      this.#promotionRepository,
    );
    this.#membershipDiscount = new MembershipDiscount();
    this.#receipt = new Receipt(this.#productRepository);
  }

  async start() {
    await this.showProducts();
    await this.processOrder();
  }

  async showProducts() {
    const products = this.#productRepository.getProducts();
    OutputView.printProducts(products);
  }

  async processOrder() {
    try {
      const purchaseInput = await this.getPurchaseInput();
      const items = InputValidator.parseInput(purchaseInput);

      // 프로모션 및 재고 확인
      for (const item of items) {
        const promoProduct = this.#productRepository.findProductWithPromotion(
          item.name,
        );
        if (!promoProduct) continue;

        const promotion = this.#promotionRepository.findPromotion(
          promoProduct.promotion,
        );
        if (!promotion) continue;

        const { promoQuantity, normalQuantity, freeQuantity } =
          this.#promotionDiscount.calculateNPlusK(
            item.quantity,
            promoProduct.quantity,
            promotion.buy,
            promotion.get,
          );

        if (
          item.quantity === promotion.buy &&
          promoProduct.quantity >= promotion.buy + promotion.get
        ) {
          const answer = await InputView.readPromotionAddQuestion(
            item.name,
            promotion.get,
          );
          if (answer.toUpperCase() === "Y") {
            item.quantity += promotion.get;
            continue;
          }
        } else if (normalQuantity > 0) {
          const answer = await InputView.readPromotionWarning(
            item.name,
            normalQuantity,
          );
          if (answer.toUpperCase() !== "Y") {
            return;
          }
        }

        item.promoQuantity = promoQuantity;
        item.normalQuantity = normalQuantity;
        item.freeQuantity = freeQuantity;
      }

      const membershipApplied = await this.getMembershipInput();

      const promotionResult = this.#promotionDiscount.calculatePromotion(items);
      const { totalAmount, formattedTotalAmount } =
        this.#receipt.calculatePurchase(items);

      const membershipDiscount = membershipApplied
        ? this.#membershipDiscount.calculateDiscountAmount(
            totalAmount,
            promotionResult.discount,
          )
        : 0;

      const receipt = this.#receipt.generateReceipt(
        items,
        promotionResult.freeItems,
        promotionResult.discount,
        membershipDiscount,
      );

      this.updateInventory(items, promotionResult);
      OutputView.printReceipt(receipt);

      await this.checkAdditionalPurchase();
    } catch (error) {
      if (error.message === "NO INPUT") {
        return;
      }
      OutputView.print(error.message);
      return;
    }
  }

  async getPurchaseInput() {
    try {
      const input = await InputView.readPurchaseInput();
      InputValidator.validatePurchaseFormat(input);
      InputValidator.validateProduct(input, this.#productRepository);
      InputValidator.validateStock(input, this.#productRepository);
      return input;
    } catch (error) {
      OutputView.print(error.message);
      return this.getPurchaseInput();
    }
  }

  async getMembershipInput() {
    try {
      const input = await InputView.readMembershipInput();
      InputValidator.validateMembershipInput(input);
      return input.toUpperCase() === "Y";
    } catch (error) {
      OutputView.print(error.message);
      return this.getMembershipInput();
    }
  }

  async checkAdditionalPurchase() {
    try {
      const input = await InputView.readAdditionalPurchaseInput();
      InputValidator.validateMembershipInput(input); // 'Y' 또는 'N' 검증
      if (input.toUpperCase() === "Y") {
        await this.start();
      } else if (input.toUpperCase() === "N") {
        OutputView.print("구매를 종료합니다. 감사합니다.");
      }
    } catch (error) {
      OutputView.print(error.message);
      return this.checkAdditionalPurchase();
    }
  }

  updateInventory(items, promotionResult) {
    promotionResult.promoQuantities.forEach((quantity, name) => {
      const promoProduct =
        this.#productRepository.findProductWithPromotion(name);
      if (promoProduct) {
        this.#productRepository.updateStock(name, quantity, true);
      }
    });

    promotionResult.normalQuantities.forEach((quantity, name) => {
      const normalProduct = this.#productRepository.findProduct(name);
      if (normalProduct) {
        this.#productRepository.updateStock(name, quantity, false);
      }
    });
  }
}

export default ConvenienceController;
