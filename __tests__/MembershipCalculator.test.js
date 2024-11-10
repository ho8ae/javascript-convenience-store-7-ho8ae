import MembershipDiscount from "../src/domain/MembershipDiscount.js";

describe("MembershipDiscount 테스트", () => {
  let membershipDiscount;

  beforeEach(() => {
    membershipDiscount = new MembershipDiscount();
  });

  test("멤버십 할인이 정상적으로 적용된다", () => {
    const totalAmount = 10000;
    const promotionDiscount = 0; // 프로모션 할인 없음
    const discount = membershipDiscount.calculateDiscountAmount(
      totalAmount,
      promotionDiscount,
    );

    expect(discount).toBe(3000); // 30% 할인
  });

  test("최대 할인 금액(8,000원)을 초과하지 않는다", () => {
    const totalAmount = 30000;
    const promotionDiscount = 0; // 프로모션 할인 없음
    const discount = membershipDiscount.calculateDiscountAmount(
      totalAmount,
      promotionDiscount,
    );

    expect(discount).toBe(8000); // 9,000원이지만 8,000원으로 제한
  });

  test("금액이 0원이면 할인이 적용되지 않는다", () => {
    const totalAmount = 0;
    const promotionDiscount = 0; // 프로모션 할인 없음
    const discount = membershipDiscount.calculateDiscountAmount(
      totalAmount,
      promotionDiscount,
    );

    expect(discount).toBe(0);
  });
});
