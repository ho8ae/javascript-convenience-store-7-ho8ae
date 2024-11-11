import { MissionUtils } from "@woowacourse/mission-utils";
import { VIEW_MESSAGES } from "../constants/index.js";

class InputView {
  static async readPurchaseInput() {
    const input = await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.PurchaseInput,
    );
    return input;
  }

  static async readMembershipInput() {
    const input = await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.MembershipInput,
    );
    return input;
  }

  static async readAdditionalPurchaseInput() {
    const input = await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.AdditionalPurchase,
    );
    return input;
  }

  static async readPromotionWarning(name, quantity) {
    return await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.PromotionWarning(name, quantity),
    );
  }

  static async readPromotionAddQuestion(name) {
    return await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.PromotionAdd(name),
    );
  }
}

export default InputView;
