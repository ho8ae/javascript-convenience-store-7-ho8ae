import { MissionUtils } from "@woowacourse/mission-utils";

class InputView {
  static async readPurchaseInput() {
    const input = await MissionUtils.Console.readLineAsync(
      "구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n"
    );
    return input;
  }

  static async readMembershipInput() {
    const input = await MissionUtils.Console.readLineAsync(
      "멤버십 할인을 받으시겠습니까? (Y/N)\n"
    );
    return input;
  }

  static async readAdditionalPurchaseInput() {
    const input = await MissionUtils.Console.readLineAsync(
      "감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)\n"
    );
    return input;
  }

  static async readPromotionWarning(name, quantity) {
    return await MissionUtils.Console.readLineAsync(
      `현재 ${name} ${quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`
    );
  }

  static async readPromotionAddQuestion(name) {
    return await MissionUtils.Console.readLineAsync(
      `현재 ${name}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`
    );
  }
}

export default InputView;