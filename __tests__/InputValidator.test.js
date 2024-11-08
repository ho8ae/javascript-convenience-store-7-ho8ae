import InputValidator from "../src/utils/InputValidator.js";
import ProductRepository from "../src/utils/repository/ProductRepository.js";

describe("InputValidator 테스트", () => {
  let productRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
  });

  test("올바른 구매 입력 형식인 경우 true를 반환한다", () => {
    const input = "[콜라-2],[사이다-1]";
    expect(InputValidator.isValidPurchaseFormat(input)).toBeTruthy();
  });

  test("대괄호가 누락된 경우 예외가 발생한다", () => {
    const input = "콜라-2],[사이다-1]";
    expect(() => {
      InputValidator.validatePurchaseFormat(input);
    }).toThrow(
      "[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.",
    );
  });

  test("하이픈이 누락된 경우 예외가 발생한다", () => {
    const input = "[콜라2],[사이다-1]";
    expect(() => {
      InputValidator.validatePurchaseFormat(input);
    }).toThrow(
      "[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.",
    );
  });

  test("수량이 양의 정수가 아닌 경우 예외가 발생한다", () => {
    const inputs = ["[콜라-0]", "[콜라--1]", "[콜라-1.5]", "[콜라-하나]"];
    inputs.forEach((input) => {
      expect(() => {
        InputValidator.validateQuantity(input);
      }).toThrow("[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.");
    });
  });

  test("존재하지 않는 상품을 입력한 경우 예외가 발생한다", () => {
    const input = "[맥주-1]";
    expect(() => {
      InputValidator.validateProduct(input, productRepository);
    }).toThrow("[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.");
  });

  test("재고보다 많은 수량을 입력한 경우 예외가 발생한다", () => {
    const input = "[콜라-100]";
    expect(() => {
      InputValidator.validateStock(input, productRepository);
    }).toThrow(
      "[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.",
    );
  });
});
