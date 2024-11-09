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
    const items = [{ name: "콜라", quantity: 2 }];

    inventory.decreaseStock(items, false); // 일반 재고에서 차감
    expect(inventory.getNormalStock("콜라")).toBe(8);
  });

  test("프로모션 재고와 일반 재고가 구분되어 관리된다", () => {
    const items = [{ name: "콜라", quantity: 3 }];

    inventory.decreaseStock(items, true); // 프로모션 재고에서 차감

    expect(inventory.getPromotionStock("콜라")).toBe(7);
    expect(inventory.getNormalStock("콜라")).toBe(10);
  });

  test("재고가 부족한 경우 예외가 발생한다", () => {
    const items = [{ name: "콜라", quantity: 15 }];

    expect(() => {
      inventory.decreaseStock(items, false);
    }).toThrow("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다.");
  });
});
