import { NUMBERS } from "../constants/index.js";

class MembershipDiscount {
  calculateDiscountAmount(amount) {
    if (!amount) return NUMBERS.Zero;

    const rawDiscount = amount * NUMBERS.MembershipDiscountRate;
    const discountInThousands =
      Math.floor(rawDiscount / NUMBERS.ThousandUnit) * NUMBERS.ThousandUnit;

    return Math.min(discountInThousands, NUMBERS.MaxMembershipDiscount);
  }
}

export default MembershipDiscount;
