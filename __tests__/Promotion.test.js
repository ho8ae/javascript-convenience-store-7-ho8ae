import Promotion from "../src/domain/Promotion.js";

describe("Promotion 클래스 테스트", () => {
  test("프로모션 객체가 정상적으로 생성된다", () => {
    const promotion = new Promotion(
      "탄산2+1",
      2,
      1,
      "2024-01-01",
      "2024-12-31",
    );
    expect(promotion).toBeDefined();
  });

  test("프로모션명이 비어있는 경우 예외가 발생한다", () => {
    expect(() => {
      new Promotion("", 2, 1, "2024-01-01", "2024-12-31");
    }).toThrow("[ERROR] 프로모션명은 필수입니다.");
  });

  test("구매 수량이 0 이하인 경우 예외가 발생한다", () => {
    expect(() => {
      new Promotion("탄산2+1", 0, 1, "2024-01-01", "2024-12-31");
    }).toThrow("[ERROR] 구매 수량은 0보다 커야 합니다.");
  });

  test("증정 수량이 0 이하인 경우 예외가 발생한다", () => {
    expect(() => {
      new Promotion("탄산2+1", 2, 0, "2024-01-01", "2024-12-31");
    }).toThrow("[ERROR] 증정 수량은 0보다 커야 합니다.");
  });

  test("날짜 형식이 올바르지 않은 경우 예외가 발생한다", () => {
    expect(() => {
      new Promotion("탄산2+1", 2, 1, "2024/01/01", "2024-12-31");
    }).toThrow("[ERROR] 날짜 형식이 올바르지 않습니다.");
  });
});
