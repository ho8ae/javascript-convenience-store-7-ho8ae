import ProductInventory from "../src/domain/ProductInventory.js";
import ProductRepository from "../src/utils/repository/ProductRepository.js";

describe("ProductInventory 테스트", () => {
  let inventory;
  let productRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
    inventory = new ProductInventory(productRepository);
  });

  test("재고가 정상적으로 초기화된다", () => {
    const colaStock = inventory.getStock("콜라");
    expect(colaStock).toBe(20); // 일반 10 + 프로모션 10
  });

  test("상품 구매 시 재고가 정상적으로 차감된다", () => {
    const items = [{ name: "콜라", quantity: 1 }];

    inventory.decreaseStock(items);
    expect(inventory.getStock("콜라")).toBe(19); // 20 - 1
  });

  test("프로모션 재고와 일반 재고가 구분되어 관리된다", () => {
    expect(inventory.getPromotionStock("콜라")).toBe(10);
    expect(inventory.getNormalStock("콜라")).toBe(10);

    const items = [{ name: "콜라", quantity: 3 }];

    inventory.decreaseStock(items);
    expect(inventory.getPromotionStock("콜라")).toBe(7); // 10 - 3
    expect(inventory.getNormalStock("콜라")).toBe(10); // 그대로
  });

  test("재고가 부족한 경우 예외가 발생한다", () => {
    const items = [{ name: "콜라", quantity: 25 }]; // 콜라 재고는 총 20개

    expect(() => {
      inventory.decreaseStock(items);
    }).toThrow("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다.");
  });

  test("프로모션 재고와 일반 재고 합산 재고 확인", () => {
    const colaTotalStock = inventory.getStock("콜라");
    expect(colaTotalStock).toBe(20); // 일반 10 + 프로모션 10
  });

  test("재고 업데이트 후 재고가 초기화된다", () => {
    const items = [{ name: "콜라", quantity: 5 }];
    inventory.decreaseStock(items);
    inventory.updateStock(); // 재고를 다시 초기화

    const colaStock = inventory.getStock("콜라");
    expect(colaStock).toBe(20); // 초기화 후 다시 20개
  });
});
