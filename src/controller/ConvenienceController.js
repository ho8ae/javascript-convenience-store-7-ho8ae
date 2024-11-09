import InputView from "../view/IntputView.js";
import OutputView from "../view/OutputView.js";
import ProductRepository from "../utils/repository/ProductRepository.js";
import PromotionRepository from "../utils/repository/PromotionRepository.js";
import PromotionDiscount from "../domain/PromotionDiscount.js";
import MembershipDiscount from "../domain/MembershipDiscount.js";
import Receipt from "../domain/Receipt.js";

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
    const products = this.#productRepository.loadProducts();
    OutputView.printProducts(products);
  }

  async processOrder() {
    try {
      const purchaseInput = await this.getPurchaseInput();
      const membershipApplied = await this.getMembershipInput();
      await this.processPayment(purchaseInput, membershipApplied);
    } catch (error) {
      OutputView.print(error.message);
      await this.processOrder();
    }
  }

  async processPayment(purchaseInput, membershipApplied) {
    const receipt = await this.#calculateReceipt(
      purchaseInput,
      membershipApplied,
    );
    OutputView.printReceipt(receipt);
    await this.checkAdditionalPurchase();
  }

  async getPurchaseInput() {
    const input = await InputView.readPurchaseInput();
    if (!this.#isValidPurchaseFormat(input)) {
      throw new Error(
        "[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.",
      );
    }
    return input;
  }

  async getMembershipInput() {
    const input = await InputView.readMembershipInput();
    const upperInput = input?.toUpperCase();

    if (upperInput !== "Y" && upperInput !== "N") {
      throw new Error("[ERROR] Y 또는 N만 입력 가능합니다.");
    }
    return upperInput === "Y";
  }

  async checkAdditionalPurchase() {
    const input = await InputView.readAdditionalPurchaseInput();
    const upperInput = input?.toUpperCase();

    if (upperInput === "Y") {
      this.#updateInventory();
      await this.start();
    }
  }

  #calculateReceipt(purchaseInput, membershipApplied) {
    const items = this.#parseInput(purchaseInput);
    const promotionResult =
      this.#promotionDiscount.calculatePromotion(purchaseInput);
    const { totalAmount } = this.#receipt.calculatePurchase(items);

    const membershipDiscountAmount = membershipApplied
      ? this.#membershipDiscount.calculateDiscount(
          totalAmount - promotionResult.discount,
        )
      : 0;

    return this.#receipt.generateReceipt(
      items,
      promotionResult.freeItems,
      promotionResult.discount,
      membershipDiscountAmount,
    );
  }

  #isValidPurchaseFormat(input) {
    const pattern = /^\[([^-\]]+)-([1-9]\d*)\]$/;
    const items = input.split(",");
    return items.every((item) => pattern.test(item.trim()));
  }

  #parseInput(input) {
    const matches = input.match(/\[([^\]]+)\]/g);
    if (!matches) {
      throw new Error(
        "[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.",
      );
    }

    return matches.map((match) => {
      const [name, quantity] = match.slice(1, -1).split("-");
      return { name: name.trim(), quantity: Number(quantity) };
    });
  }

  #updateInventory() {
    this.#productRepository.loadProducts();
  }
}

export default ConvenienceController;
