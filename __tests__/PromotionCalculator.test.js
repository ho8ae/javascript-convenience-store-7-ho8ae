import PromotionDiscount from "../src/domain/PromotionDiscount.js";
import ProductRepository from "../src/utils/repository/ProductRepository.js";
import PromotionRepository from "../src/utils/repository/PromotionRepository.js";
import { MissionUtils } from "@woowacourse/mission-utils";

describe("PromotionCalculator 테스트", () => {
  let promotionDiscount;
  let productRepository;
  let promotionRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
    promotionRepository = new PromotionRepository();
    promotionDiscount = new PromotionDiscount(
      productRepository,
      promotionRepository,
    );

    jest
      .spyOn(MissionUtils.DateTimes, "now")
      .mockReturnValue(new Date("2024-11-08"));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("1+1 프로모션이 적용되어 1개가 무료로 증정된다", () => {
    const input = [{ name: "오렌지주스", quantity: 2 }];
    const result = promotionDiscount.calculatePromotion(input);

    expect(result.freeItems).toContainEqual({
      name: "오렌지주스",
      quantity: 1,
    });
    expect(result.discount).toBe(1800);
  });

  test("반짝할인 프로모션이 기간 내에 적용된다", () => {
    const input = [{ name: "감자칩", quantity: 2 }];
    const result = promotionDiscount.calculatePromotion(input);

    expect(result.freeItems).toContainEqual({
      name: "감자칩",
      quantity: 1,
    });
    expect(result.discount).toBe(1500); // 감자칩 1개 가격만큼 할인
  });

  test("프로모션 기간이 아닌 경우 할인이 적용되지 않는다", () => {
    jest
      .spyOn(MissionUtils.DateTimes, "now")
      .mockReturnValue(new Date("2024-10-15"));

    const input = [{ name: "감자칩", quantity: 2 }];
    const result = promotionDiscount.calculatePromotion(input);

    expect(result.freeItems).toHaveLength(0);
    expect(result.discount).toBe(0);
  });

  test("프로모션 적용 수량이 부족한 경우 할인이 적용되지 않는다", () => {
    const input = [{ name: "콜라", quantity: 1 }];
    const result = promotionDiscount.calculatePromotion(input);

    expect(result.freeItems).toHaveLength(0);
    expect(result.discount).toBe(0);
  });
});
