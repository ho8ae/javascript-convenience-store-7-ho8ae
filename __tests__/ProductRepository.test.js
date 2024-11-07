import ProductRepository from "../domain/ProductRepository.js";

describe("ProductRepository 테스트", () => {
  let productRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
  });

  test("Products.md 파일을 성공적으로 파싱한다", () => {
    const products = productRepository.loadProducts();

    expect(products).toBeDefined();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty("name", "콜라");
    expect(products[0]).toHaveProperty("price", 1000);
    expect(products[0]).toHaveProperty("quantity", 10);
    expect(products[0]).toHaveProperty("promotion", "탄산2+1");
  });

  test("파일 형식이 올바르지 않은 경우 예외가 발생한다", () => {
    // 파일 내용 수정하여 테스트
    expect(() => {
      productRepository.loadProducts("invalid-products.md");
    }).toThrow("[ERROR]");
  });
});
