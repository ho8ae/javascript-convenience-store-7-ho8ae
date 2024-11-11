import { MissionUtils } from "@woowacourse/mission-utils";
import {
  VIEW_MESSAGES,
  RECEIPT_TEMPLATE,
  DISPLAY,
  STRING_PATTERNS,
  NUMBERS,
} from "../constants/index.js";

const getStockText = (quantity) => {
  if (quantity === NUMBERS.Zero) {
    return DISPLAY.OutOfStock;
  }
  return `${quantity}${DISPLAY.StockUnit}`;
};

const getPromotionText = (promotion) => {
  if (!promotion) {
    return STRING_PATTERNS.Empty;
  }
  return `${STRING_PATTERNS.Space}${promotion}`;
};

const getFormattedAmount = (amount) => {
  if (!amount) {
    return String(NUMBERS.Zero);
  }
  return amount;
};

const OutputView = {
  print(message) {
    MissionUtils.Console.print(message);
  },

  printNewLine() {
    this.print(STRING_PATTERNS.Empty);
  },

  printProducts(products) {
    this.print(VIEW_MESSAGES.Welcome);
    this.print(VIEW_MESSAGES.CurrentProducts);

    products.forEach((product) => {
      const stockText = getStockText(product.quantity);
      const promotionText = getPromotionText(product.promotion);

      this.print(
        `- ${product.name} ${product.price.toLocaleString()}${STRING_PATTERNS.Won} ${stockText}${promotionText}`,
      );
    });

    this.printNewLine();
  },

  printReceipt(receipt) {
    this.print(RECEIPT_TEMPLATE.Header);
    this.print(RECEIPT_TEMPLATE.ProductHeader);

    receipt.items.forEach((item) => {
      const formattedAmount = getFormattedAmount(item.formattedAmount);
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
      NUMBERS.Zero,
    );

    this.print(RECEIPT_TEMPLATE.Footer);
    this.print(
      `${RECEIPT_TEMPLATE.TotalAmount}\t\t${totalQuantity}\t${getFormattedAmount(receipt.formattedTotalAmount)}`,
    );
    this.print(
      `${RECEIPT_TEMPLATE.PromotionDiscount}\t\t\t-${getFormattedAmount(receipt.formattedPromotionDiscount)}`,
    );
    this.print(
      `${RECEIPT_TEMPLATE.MembershipDiscount}\t\t\t-${getFormattedAmount(receipt.formattedMembershipDiscount)}`,
    );
    this.print(
      `${RECEIPT_TEMPLATE.FinalAmount}\t\t\t ${getFormattedAmount(receipt.formattedFinalAmount)}`,
    );
    this.printNewLine();
  },
};

export default OutputView;
