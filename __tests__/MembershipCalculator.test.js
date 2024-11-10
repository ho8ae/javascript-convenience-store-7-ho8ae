import MembershipDiscount from "../src/domain/MembershipDiscount.js";

describe("MembershipDiscount 테스트", () => {
  let membershipDiscount;

  beforeEach(() => {
    membershipDiscount = new MembershipDiscount();
  });

  test("멤버십 할인이 정상적으로 적용된다", () => {
    const totalAmount = 10000;
    const promotionDiscount = 0; // 프로모션 할인 없음
    const discount = membershipDiscount.calculateDiscountAmount(totalAmount, promotionDiscount);

    expect(discount).toBe(3000); // 30% 할인
  });

  test("최대 할인 금액(8,000원)을 초과하지 않는다", () => {
    const totalAmount = 30000;
    const promotionDiscount = 0; // 프로모션 할인 없음
    const discount = membershipDiscount.calculateDiscountAmount(totalAmount, promotionDiscount);

    expect(discount).toBe(8000); // 9,000원이지만 8,000원으로 제한
  });

  test("프로모션이 적용된 금액은 멤버십 할인에서 제외된다", () => {
    const totalAmount = 10000;
    const promotionDiscount = 3000;
    const discount = membershipDiscount.calculateDiscountAmount(totalAmount, promotionDiscount);

    expect(discount).toBe(2000); // (10000 - 3000) * 0.3 = 2100, 천 원 단위로 내림하면 2000
  });

  test("금액이 0원이면 할인이 적용되지 않는다", () => {
    const totalAmount = 0;
    const promotionDiscount = 0; // 프로모션 할인 없음
    const discount = membershipDiscount.calculateDiscountAmount(totalAmount, promotionDiscount);

    expect(discount).toBe(0);
  });

  test("프로모션 할인 후 금액이 0원이면 할인이 적용되지 않는다", () => {
    const totalAmount = 5000;
    const promotionDiscount = 5000; // 프로모션 할인으로 인해 전체 금액이 0이 됨
    const discount = membershipDiscount.calculateDiscountAmount(totalAmount, promotionDiscount);

    expect(discount).toBe(0);
  });
});
