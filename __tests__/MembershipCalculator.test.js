import MembershipDiscount from "../src/domain/MembershipDiscount.js";

describe("MembershipDiscount 테스트", () => {
  let membershipDiscount;

  beforeEach(() => {
    membershipDiscount = new MembershipDiscount();
  });

  test("멤버십 할인이 정상적으로 적용된다", () => {
    const amount = 10000;
    const discount = membershipDiscount.calculateDiscount(amount);

    expect(discount).toBe(3000); // 30% 할인
  });

  test("최대 할인 금액(8,000원)을 초과하지 않는다", () => {
    const amount = 30000;
    const discount = membershipDiscount.calculateDiscount(amount);

    expect(discount).toBe(8000); // 9,000원이지만 8,000원으로 제한
  });

  test("프로모션이 적용된 금액은 멤버십 할인에서 제외된다", () => {
    const totalAmount = 10000;
    const promotionDiscount = 3000;
    const discount = membershipDiscount.calculateDiscount(
      totalAmount - promotionDiscount,
    );

    expect(discount).toBe(2100); // (10000 - 3000) * 0.3
  });

  test("금액이 0원이면 할인이 적용되지 않는다", () => {
    const amount = 0;
    const discount = membershipDiscount.calculateDiscount(amount);

    expect(discount).toBe(0);
  });

  test("멤버십 미적용 시 할인이 적용되지 않는다", () => {
    const amount = 10000;
    const discount = membershipDiscount.calculateDiscount(amount, false);

    expect(discount).toBe(0);
  });
});
