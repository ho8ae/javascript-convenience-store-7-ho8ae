import ConvenienceController from "../../src/controller/ConvenienceController.js";
import { MissionUtils } from "@woowacourse/mission-utils";

describe("ConvenienceController 테스트", () => {
  let controller;
  let logSpy;

  beforeEach(() => {
    controller = new ConvenienceController();
    logSpy = jest.spyOn(MissionUtils.Console, "print");
    jest
      .spyOn(MissionUtils.DateTimes, "now")
      .mockReturnValue(new Date("2024-01-15"));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("상품 구매 과정이 정상적으로 진행된다", async () => {
    // Mock 입력값 설정
    MissionUtils.Console.readLineAsync = jest
      .fn()
      .mockResolvedValueOnce("[콜라-2]") // 구매 입력
      .mockResolvedValueOnce("Y") // 멤버십 적용
      .mockResolvedValueOnce("N"); // 추가 구매 여부

    await controller.start();

    // 상품 목록 출력 확인
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("안녕하세요. W편의점입니다."),
    );

    // 영수증 출력 확인
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("==============W 편의점================"),
    );
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("콜라"));
  });

  test("잘못된 입력 시 에러 메시지를 출력하고 재입력을 받는다", async () => {
    MissionUtils.Console.readLineAsync = jest
      .fn()
      .mockResolvedValueOnce("[콜라]") // 잘못된 형식
      .mockResolvedValueOnce("[콜라-2]") // 정상 입력
      .mockResolvedValueOnce("Y")
      .mockResolvedValueOnce("N");

    await controller.start();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[ERROR]"));
  });

  test("추가 구매를 진행할 수 있다", async () => {
    MissionUtils.Console.readLineAsync = jest
      .fn()
      .mockResolvedValueOnce("[콜라-1]")
      .mockResolvedValueOnce("N") // 멤버십 미적용
      .mockResolvedValueOnce("Y") // 추가 구매
      .mockResolvedValueOnce("[사이다-1]")
      .mockResolvedValueOnce("N")
      .mockResolvedValueOnce("N");

    await controller.start();

    // 두 번의 영수증 출력 확인
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("콜라"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("사이다"));
  });
});
