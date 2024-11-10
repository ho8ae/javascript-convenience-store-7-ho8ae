import InputView from "../../src/view/InputView";
import { MissionUtils } from "@woowacourse/mission-utils";

describe("InputView 테스트", () => {
  test("상품 구매 입력을 처리한다", async () => {
    // Mock Console input
    MissionUtils.Console.readLineAsync = jest
      .fn()
      .mockResolvedValue("[콜라-2]");

    const input = await InputView.readPurchaseInput();
    expect(input).toBe("[콜라-2]");
  });

  test("멤버십 적용 여부를 입력받는다", async () => {
    MissionUtils.Console.readLineAsync = jest.fn().mockResolvedValue("Y");

    const input = await InputView.readMembershipInput();
    expect(input).toBe("Y");
  });
});
