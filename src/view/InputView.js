import { MissionUtils } from "@woowacourse/mission-utils";
import { VIEW_MESSAGES } from "../constants/index.js";

const InputView = {
  async readPurchaseInput() {
    const input = await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.PurchaseInput,
    );
    return input;
  },

  async readMembershipInput() {
    const input = await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.MembershipInput,
    );
    return input;
  },

  async readAdditionalPurchaseInput() {
    const input = await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.AdditionalPurchase,
    );
    return input;
  },

  async readPromotionWarning(name, quantity) {
    return await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.PromotionWarning(name, quantity),
    );
  },

  async readPromotionAddQuestion(name) {
    return await MissionUtils.Console.readLineAsync(
      VIEW_MESSAGES.PromotionAdd(name),
    );
  },
};

export default InputView;
