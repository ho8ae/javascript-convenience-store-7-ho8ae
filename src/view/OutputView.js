import { MissionUtils } from "@woowacourse/mission-utils";

class OutputView {
  static print(message) {
    MissionUtils.Console.print(message);
  }

  static printProducts(products) {
    this.print("안녕하세요. W편의점입니다.");
    this.print("현재 보유하고 있는 상품입니다.\n");

    products.forEach((product) => {
      const { name, price, quantity, promotion } = product;
      const stock = quantity === 0 ? "재고 없음" : `${quantity}개`;
      const promotionText = promotion ? ` ${promotion}` : "";

      this.print(
        `- ${name} ${this.#formatAmount(price)}원 ${stock}${promotionText}`,
      );
    });
  }

  static printReceipt(receipt) {
    this.#printReceiptHeader();
    this.#printPurchaseItems(receipt.items);

    if (receipt.freeItems.length > 0) {
      this.#printFreeItems(receipt.freeItems);
    }

    this.#printAmountDetails(receipt);
  }

  static #printReceiptHeader() {
    this.print("==============W 편의점================");
    this.print("상품명\t\t수량\t금액");
  }

  static #printPurchaseItems(items) {
    items.forEach((item) => {
      this.print(
        `${item.name}\t\t${item.quantity}\t${this.#formatAmount(item.amount)}`,
      );
    });
  }

  static #printFreeItems(freeItems) {
    this.print("=============증\t정===============");
    freeItems.forEach((item) => {
      this.print(`${item.name}\t\t${item.quantity}`);
    });
  }

  static #printAmountDetails(receipt) {
    this.print("====================================");
    this.print(`총구매액\t\t\t${this.#formatAmount(receipt.totalAmount)}`);
    this.print(
      `행사할인\t\t\t-${this.#formatAmount(receipt.promotionDiscount)}`,
    );
    this.print(
      `멤버십할인\t\t\t-${this.#formatAmount(receipt.membershipDiscount)}`,
    );
    this.print(`내실돈\t\t\t${this.#formatAmount(receipt.finalAmount)}`);
  }

  static #formatAmount(amount) {
    return amount.toLocaleString();
  }
}

export default OutputView;
