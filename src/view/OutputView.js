import { MissionUtils } from "@woowacourse/mission-utils";

class OutputView {
  static print(message) {
    MissionUtils.Console.print(message);
  }

  static printProducts(products) {
    this.print("안녕하세요. W편의점입니다.");
    this.print("현재 보유하고 있는 상품입니다.\n");

    products.forEach((product) => {
      const stockText =
        product.quantity === 0 ? "재고 없음" : `${product.quantity}개`;
      const promotionText = product.promotion ? ` ${product.promotion}` : "";

      this.print(
        `- ${product.name} ${product.price.toLocaleString()}원 ${stockText}${promotionText}`
      );
    });
    this.print("");
  }

  static printReceipt(receipt) {
    this.print("\n==============W 편의점================");
    this.print("상품명\t\t수량\t금액");

    receipt.items.forEach((item) => {
      const formattedAmount = item.formattedAmount || "0"; // undefined 방지
      this.print(`${item.name}\t\t${item.quantity}\t${formattedAmount}`);
    });

    if (receipt.freeItems.length > 0) {
      this.print("=============증\t정===============");
      receipt.freeItems.forEach((item) => {
        this.print(`${item.name}\t\t${item.quantity}`);
      });
    }

    const totalQuantity = receipt.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    this.print("====================================");
    this.print(`총구매액\t\t${totalQuantity}\t${receipt.formattedTotalAmount || "0"}`);
    this.print(`행사할인\t\t\t-${receipt.formattedPromotionDiscount || "0"}`);
    this.print(`멤버십할인\t\t\t-${receipt.formattedMembershipDiscount || "0"}`);
    this.print(`내실돈\t\t\t ${receipt.formattedFinalAmount || "0"}`);
  }
}

export default OutputView;