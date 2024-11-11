import { MissionUtils } from "@woowacourse/mission-utils";
import { 
  VIEW_MESSAGES, 
  RECEIPT_TEMPLATE, 
  DISPLAY, 
  STRING_PATTERNS, 
  NUMBERS 
} from '../constants/index.js';

class OutputView {
  static print(message) {
    MissionUtils.Console.print(message);
  }

  static printProducts(products) {
    this.print(VIEW_MESSAGES.Welcome);
    this.print(VIEW_MESSAGES.CurrentProducts);

    products.forEach((product) => {
      const stockText = product.quantity === NUMBERS.Zero 
        ? DISPLAY.OutOfStock 
        : `${product.quantity}${DISPLAY.StockUnit}`;
      const promotionText = product.promotion 
        ? `${STRING_PATTERNS.Space}${product.promotion}` 
        : STRING_PATTERNS.Empty;

      this.print(
        `- ${product.name} ${product.price.toLocaleString()}${STRING_PATTERNS.Won} ${stockText}${promotionText}`
      );
    });
    this.print(STRING_PATTERNS.Empty);
  }

  static printReceipt(receipt) {
    this.print(STRING_PATTERNS.NewLine + RECEIPT_TEMPLATE.Header);
    this.print(RECEIPT_TEMPLATE.ProductHeader);

    receipt.items.forEach((item) => {
      const formattedAmount = item.formattedAmount || String(NUMBERS.Zero);
      this.print(`${item.name}\t\t${item.quantity}\t${formattedAmount}`);
    });

    if (receipt.freeItems.length > NUMBERS.Zero) {
      this.print(RECEIPT_TEMPLATE.FreeItemsHeader);
      receipt.freeItems.forEach((item) => {
        this.print(`${item.name}\t\t${item.quantity}`);
      });
    }

    const totalQuantity = receipt.items.reduce(
      (sum, item) => sum + item.quantity,
      NUMBERS.Zero
    );

    this.print(RECEIPT_TEMPLATE.Footer);
    this.print(`${RECEIPT_TEMPLATE.TotalAmount}\t\t${totalQuantity}\t${receipt.formattedTotalAmount || String(NUMBERS.Zero)}`);
    this.print(`${RECEIPT_TEMPLATE.PromotionDiscount}\t\t\t-${receipt.formattedPromotionDiscount || String(NUMBERS.Zero)}`);
    this.print(`${RECEIPT_TEMPLATE.MembershipDiscount}\t\t\t-${receipt.formattedMembershipDiscount || String(NUMBERS.Zero)}`);
    this.print(`${RECEIPT_TEMPLATE.FinalAmount}\t\t\t ${receipt.formattedFinalAmount || String(NUMBERS.Zero)}`);
  }
}

export default OutputView;