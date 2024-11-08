import PromotionRepository from "../../src/uitls/repository/PromotionRepository.js";

describe("PromotionRepository 테스트", () => {
  let promotionRepository;

  beforeEach(() => {
    promotionRepository = new PromotionRepository();
  });

  test("Promotions.md 파일을 성공적으로 파싱한다", () => {
    const promotions = promotionRepository.loadPromotions();

    expect(promotions).toBeDefined();
    expect(promotions.length).toBeGreaterThan(0);
    expect(promotions[0]).toHaveProperty("name", "탄산2+1");
    expect(promotions[0]).toHaveProperty("buy", 2);
    expect(promotions[0]).toHaveProperty("get", 1);
    expect(promotions[0]).toHaveProperty("startDate", "2024-01-01");
    expect(promotions[0]).toHaveProperty("endDate", "2024-12-31");
  });

  test("파일 형식이 올바르지 않은 경우 예외가 발생한다", () => {
    expect(() => {
      promotionRepository.loadPromotions("invalid-promotions.md");
    }).toThrow("[ERROR]");
  });
});
