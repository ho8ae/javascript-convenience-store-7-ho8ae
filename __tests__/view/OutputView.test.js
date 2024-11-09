import OutputView from "../../src/view/OutputView.js";
import { MissionUtils } from "@woowacourse/mission-utils";

describe("OutputView 테스트", () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(MissionUtils.Console, "print");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("상품 목록을 출력한다", () => {
    const products = [
      { name: "콜라", price: 1000, quantity: 10, promotion: "탄산2+1" },
      { name: "사이다", price: 1000, quantity: 0, promotion: null },
    ];

    OutputView.printProducts(products);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("- 콜라 1,000원 10개 탄산2+1"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("- 사이다 1,000원 재고 없음"),
    );
  });

  test("영수증을 출력한다", () => {
    const receipt = {
      items: [{ name: "콜라", quantity: 3, amount: 3000 }],
      freeItems: [{ name: "콜라", quantity: 1 }],
      totalAmount: 3000,
      promotionDiscount: 1000,
      membershipDiscount: 600,
      finalAmount: 1400,
    };

    OutputView.printReceipt(receipt);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("==============W 편의점================"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("콜라\t\t3\t3,000"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("내실돈\t\t\t1,400"),
    );
  });
});

