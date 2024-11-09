import ConvenienceController from "../src/controller/ConvenienceController.js";
import { MissionUtils } from "@woowacourse/mission-utils";

describe("ConvenienceController 테스트", () => {
  let mockConsole;
  let controller;

  const setInput = (inputs) => {
    mockConsole.input = [...inputs];
  };

  beforeEach(() => {
    mockConsole = {
      output: [],
      input: [],
      readLineAsync: async () => {
        const input = mockConsole.input.shift();
        if (!input) {
          return "N";
        }
        return input;
      },
      print: (message) => {
        mockConsole.output.push(message);
      },
    };

    jest
      .spyOn(MissionUtils.Console, "readLineAsync")
      .mockImplementation(mockConsole.readLineAsync);
    jest
      .spyOn(MissionUtils.Console, "print")
      .mockImplementation(mockConsole.print);
    jest
      .spyOn(MissionUtils.DateTimes, "now")
      .mockReturnValue(new Date("2024-01-15"));

    controller = new ConvenienceController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("상품 목록이 정상적으로 출력된다", async () => {
    await controller.showProducts();

    expect(
      mockConsole.output.some((msg) => msg.includes("안녕하세요")),
    ).toBeTruthy();
    expect(mockConsole.output.some((msg) => msg.includes("콜라"))).toBeTruthy();
  });

  test("상품 구매가 정상적으로 진행된다", async () => {
    setInput(["[콜라-2]", "Y", "N"]);

    await controller.processOrder();

    expect(
      mockConsole.output.some((msg) => msg.includes("W 편의점")),
    ).toBeTruthy();
    expect(mockConsole.output.some((msg) => msg.includes("콜라"))).toBeTruthy();
  });

  test("잘못된 구매 입력 시 에러 메시지를 출력한다", async () => {
    const invalidInput = "[콜라]";

    await expect(controller.getPurchaseInput()).rejects.toThrow(
      "[ERROR] 올바르지 않은 형식으로 입력했습니다.",
    );
  });

  test("잘못된 멤버십 입력 시 에러 메시지를 출력한다", async () => {
    setInput(["X"]); // 잘못된 입력

    await expect(controller.getMembershipInput()).rejects.toThrow(
      "[ERROR] Y 또는 N만 입력 가능합니다.",
    );
  });

  test("추가 구매 프로세스가 정상적으로 동작한다", async () => {
    setInput([
      "[콜라-1]", // 첫 번째 구매
      "N", // 멤버십 미적용
      "Y", // 추가 구매
      "[사이다-1]", // 두 번째 구매
      "N", // 멤버십 미적용
      "N", // 구매 종료
    ]);

    await controller.start();

    // 두 상품이 모두 영수증에 포함되었는지 확인
    const output = mockConsole.output.join("\n");
    expect(output).toContain("콜라");
    expect(output).toContain("사이다");
  });

  test("결제 금액이 정상적으로 계산된다", async () => {
    setInput(["[콜라-2]", "Y", "N"]); // 2,000원 + 멤버십 할인

    await controller.processOrder();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("2,000"); // 총구매액
    expect(output).toContain("700"); // 수정: 실제 최종 금액으로 변경
    // 2,000원 - 프로모션 1,000원 - 멤버십 300원 = 700원
  });

 
});
