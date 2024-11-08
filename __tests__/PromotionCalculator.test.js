import PromotionCalculator from "../src/utils/PromotionCalculator.js";
import ProductRepository from "../src/utils/repository/ProductRepository.js";
import PromotionRepository from "../src/utils/repository/PromotionRepository.js";
import { MissionUtils } from "@woowacourse/mission-utils";

describe("PromotionCalculator 테스트", () => {
  let promotionCalculator;
  let productRepository;
  let promotionRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
    promotionRepository = new PromotionRepository();
    promotionCalculator = new PromotionCalculator(
      productRepository,
      promotionRepository,
    );

    // 현재 날짜를 2024-01-15로 고정
    jest
      .spyOn(MissionUtils.DateTimes, "now")
      .mockReturnValue(new Date("2024-01-15"));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("2+1 프로모션이 적용되어 1개가 무료로 증정된다", () => {
    const input = "[콜라-3]"; // 콜라는 2+1 프로모션
    const result = promotionCalculator.calculatePromotion(input);

    expect(result.freeItems).toContainEqual({ name: "콜라", quantity: 1 });
    expect(result.discount).toBe(1000); // 콜라 1개 가격만큼 할인
  });

  test("1+1 프로모션이 적용되어 1개가 무료로 증정된다", () => {
    const input = "[오렌지주스-2]"; // MD추천상품 1+1 프로모션
    const result = promotionCalculator.calculatePromotion(input);

    expect(result.freeItems).toContainEqual({
      name: "오렌지주스",
      quantity: 1,
    });
    expect(result.discount).toBe(1800);
  });
  test("프로모션 기간이 아닌 경우 할인이 적용되지 않는다", () => {
    // 현재 날짜를 2024-10-15로 변경 (반짝할인 기간 이전)
    jest
      .spyOn(MissionUtils.DateTimes, "now")
      .mockReturnValue(new Date("2024-10-15"));

    const input = "[감자칩-2]";
    const result = promotionCalculator.calculatePromotion(input);

    expect(result.freeItems).toHaveLength(0);
    expect(result.discount).toBe(0);
  });

  test("프로모션 적용 수량이 부족한 경우 할인이 적용되지 않는다", () => {
    const input = "[콜라-1]"; // 2+1 프로모션인데 1개만 구매
    const result = promotionCalculator.calculatePromotion(input);

    expect(result.freeItems).toHaveLength(0);
    expect(result.discount).toBe(0);
  });
});
