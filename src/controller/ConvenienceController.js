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
    const products = this.#productRepository.getProducts();
    OutputView.printProducts(products);
  }
  async processOrder() {
    try {
      const purchaseInput = await this.getPurchaseInput();
      const items = this.#promotionDiscount.parseInput(purchaseInput);

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

        // 모든 프로모션에 대해 추가 구매 가능 여부 체크
        const { promoQuantity, normalQuantity, freeQuantity } =
          this.#promotionDiscount.calculateNPlusK(
            item.quantity,
            promoProduct.quantity,
            promotion.buy,
            promotion.get,
          );

        // 추가 구매 제안
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
        }
        // 프로모션 미적용 수량 안내
        else if (normalQuantity > 0) {
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

      // 영수증 생성 및 출력
      const promotionResult = this.#promotionDiscount.calculatePromotion(items);
      const { totalAmount } = this.#receipt.calculatePurchase(items);
      const membershipDiscount = membershipApplied
        ? Math.floor(
            Math.min((totalAmount - promotionResult.discount) * 0.3, 8000),
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

  updateInventory(items, promotionResult) {
    // 프로모션 재고 먼저 차감
    promotionResult.promoQuantities.forEach((quantity, name) => {
      const promoProduct =
        this.#productRepository.findProductWithPromotion(name);
      if (promoProduct) {
        this.#productRepository.updateStock(name, quantity, true);
      }
    });

    // 일반 재고 차감
    promotionResult.normalQuantities.forEach((quantity, name) => {
      const normalProduct = this.#productRepository.findProduct(name);
      if (normalProduct) {
        this.#productRepository.updateStock(name, quantity, false);
      }
    });
  }

  async getPurchaseInput() {
    const input = await InputView.readPurchaseInput();

    if (!this.#isValidPurchaseFormat(input)) {
      throw new Error(
        "[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.",
      );
    }

    const items = this.#promotionDiscount.parseInput(input);

    for (const item of items) {
      if (!this.#productRepository.hasProduct(item.name)) {
        throw new Error(
          "[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.",
        );
      }

      const totalStock = this.#productRepository.getTotalStock(item.name);
      if (totalStock < item.quantity) {
        throw new Error(
          "[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.",
        );
      }
    }

    return input;
  }

  #getTotalStock(name) {
    const products = this.#productRepository.getProducts();
    const productExists = products.some((p) => p.name === name);

    if (!productExists) {
      return null;
    }

    return products
      .filter((p) => p.name === name)
      .reduce((sum, p) => sum + p.quantity, 0);
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
    if (input.toUpperCase() === "Y") {
      await this.start();
    } else if (input.toUpperCase() !== "N") {
      OutputView.print("[ERROR] Y 또는 N만 입력 가능합니다.");
      return;
    }
  }

  #isValidPurchaseFormat(input) {
    const pattern =
      /^\[([^-\]]+)-([1-9]\d*)\](\s*,\s*\[([^-\]]+)-([1-9]\d*)\])*$/;
    return pattern.test(input);
  }
}

export default ConvenienceController;
