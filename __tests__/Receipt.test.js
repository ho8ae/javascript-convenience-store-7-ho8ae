describe("Receipt 테스트", () => {
  let receipt;
  let productRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
    receipt = new Receipt(productRepository);
  });

  test("구매 내역이 정상적으로 계산된다", () => {
    const items = [
      { name: "콜라", quantity: 3 },
      { name: "에너지바", quantity: 2 },
    ];

    const result = receipt.calculatePurchase(items);

    expect(result.totalAmount).toBe(7000); // 콜라 3개(3000) + 에너지바 2개(4000)
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      name: "콜라",
      quantity: 3,
      amount: 3000,
    });
  });

  test("증정 상품이 영수증에 포함된다", () => {
    const items = [{ name: "콜라", quantity: 3 }];
    const freeItems = [{ name: "콜라", quantity: 1 }];

    const result = receipt.generateReceipt(items, freeItems, 3000, 900);

    expect(result.freeItems).toHaveLength(1);
    expect(result.freeItems[0]).toEqual({
      name: "콜라",
      quantity: 1,
    });
  });

  test("할인 금액이 올바르게 계산된다", () => {
    const items = [{ name: "콜라", quantity: 3 }];
    const freeItems = [{ name: "콜라", quantity: 1 }];
    const promotionDiscount = 1000;
    const membershipDiscount = 600;

    const result = receipt.generateReceipt(
      items,
      freeItems,
      promotionDiscount,
      membershipDiscount,
    );

    expect(result.totalAmount).toBe(3000);
    expect(result.promotionDiscount).toBe(1000);
    expect(result.membershipDiscount).toBe(600);
    expect(result.finalAmount).toBe(1400); // 3000 - 1000 - 600
  });

  test("금액이 천 단위로 포맷팅된다", () => {
    const items = [{ name: "정식도시락", quantity: 2 }]; // 6400 * 2

    const result = receipt.calculatePurchase(items);

    expect(result.totalAmount).toBe(12800);
    expect(result.formattedTotalAmount).toBe("12,800");
  });
});
