import ConvenienceController from "../src/controller/ConvenienceController.js";
import { MissionUtils } from "@woowacourse/mission-utils";

describe("ConvenienceController 테스트", () => {
  let mockConsole;
  let controller;

  beforeEach(() => {
    mockConsole = {
      output: [],
      input: [],
    };

    // Console mock 설정
    MissionUtils.Console.readLineAsync = jest.fn();
    MissionUtils.Console.print = jest.fn((message) => {
      mockConsole.output.push(message);
    });

    // 현재 날짜 mock - 프로모션 유효기간 내
    jest
      .spyOn(MissionUtils.DateTimes, "now")
      .mockReturnValue(new Date("2024-01-15"));

    controller = new ConvenienceController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockInput = (...inputs) => {
    const allInputs = [...inputs];
    let callCount = 0;

    MissionUtils.Console.readLineAsync.mockImplementation(() => {
      if (callCount >= allInputs.length) {
        throw new Error("NO INPUT");
      }
      const input = allInputs[callCount];
      callCount += 1;
      return Promise.resolve(input);
    });
  };

  test("1+1 프로모션이 적용되어 구매가 완료된다", async () => {
    mockInput(
      "[오렌지주스-1]",  // 상품 구매
      "Y",              // 프로모션 수락
      "N",              // 멤버십 거절
      "N"               // 추가 구매 거절
    );

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("오렌지주스");
    expect(output).toContain("증");
    expect(output).toContain("1,800");
  });

  test("2+1 프로모션이 적용되어 구매가 완료된다", async () => {
    mockInput(
      "[콜라-2]",       // 상품 구매
      "Y",              // 프로모션 수락
      "N",              // 멤버십 거절
      "N"               // 추가 구매 거절
    );

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("콜라");
    expect(output).toContain("증");
    expect(output).toContain("2,000");
  });

  test("프로모션 제안을 거절하면 일반 구매로 처리된다", async () => {
    mockInput(
      "[오렌지주스-1]",  // 상품 구매
      "N",              // 프로모션 거절
      "N",              // 멤버십 거절
      "N"               // 추가 구매 거절
    );

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("오렌지주스");
    expect(output).not.toContain("증");
    expect(output).toContain("1,800");
  });

  test("여러 상품 동시 구매가 가능하다", async () => {
    mockInput(
      "[콜라-2],[사이다-1]", 
      "Y",              // 콜라 프로모션 수락
      "N",              // 멤버십 거절
      "N"               // 추가 구매 거절
    );

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("콜라");
    expect(output).toContain("사이다");
  });

  test("재고 부족 시 에러 메시지가 출력된다", async () => {
    mockInput(
      "[콜라-30]",      // 재고 초과 구매 시도
      "[콜라-2]",       // 정상 구매
      "Y",              // 프로모션 수락
      "N",              // 멤버십 거절
      "N"               // 추가 구매 거절
    );

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다");
  });

  test("추가 구매가 정상적으로 동작한다", async () => {
    mockInput(
      "[콜라-2]",       // 첫 구매
      "Y",              // 프로모션 수락
      "N",              // 멤버십 거절
      "Y",              // 추가 구매
      "[사이다-1]",     // 두번째 구매
      "N",              // 멤버십 거절
      "N"               // 종료
    );

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toMatch(/콜라.*사이다/s);
  });

  test("잘못된 입력 형식에 대한 에러 처리", async () => {
    mockInput(
      "잘못된형식", 
      "[콜라-2]",       // 정상 구매
      "Y",              // 프로모션 수락
      "N",              // 멤버십 거절
      "N"               // 추가 구매 거절
    );

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("[ERROR] 올바르지 않은 형식으로 입력했습니다");
  });

  test("프로모션 입력에 대한 에러 처리", async () => {
    mockInput(
      "[오렌지주스-1]", // 상품 구매
      "invalid",       // 잘못된 프로모션 응답
      "Y",            // 올바른 프로모션 응답
      "N",            // 멤버십 거절
      "N"             // 추가 구매 거절
    );

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("[ERROR] Y 또는 N만 입력 가능합니다");
  });
});