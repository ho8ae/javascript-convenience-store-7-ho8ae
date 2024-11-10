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

    // 현재 날짜 mock
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

  test("상품 목록이 출력되고 구매가 완료된다", async () => {
    mockInput("[콜라-2]", "N", "N");

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("안녕하세요");
    expect(output).toContain("콜라");
    expect(output).toContain("W 편의점");
  });

  test("여러 상품 동시 구매가 가능하다", async () => {
    mockInput("[콜라-2],[사이다-1]", "N", "N");

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("콜라");
    expect(output).toContain("사이다");
  });

  test("재고 부족 시 에러 메시지가 출력된다", async () => {
    mockInput("[콜라-30]", "[콜라-2]", "N", "N");

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다");
  });

  test("추가 구매가 정상적으로 동작한다", async () => {
    mockInput(
      "[콜라-2]", // 첫 구매
      "N", // 멤버십
      "Y", // 추가 구매
      "[사이다-1]", // 두번째 구매
      "N", // 멤버십
      "N", // 종료
    );

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toMatch(/콜라.*사이다/s);
  });

  test("잘못된 입력 형식에 대한 에러 처리", async () => {
    mockInput("잘못된형식", "[콜라-2]", "N", "N");

    await controller.start();

    const output = mockConsole.output.join("\n");
    expect(output).toContain("[ERROR] 올바르지 않은 형식으로 입력했습니다");
  });
});
