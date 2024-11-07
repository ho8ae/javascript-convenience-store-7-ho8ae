describe("Product 클래스 테스트", () => {
  test("가격이 0 이하인 경우 예외가 발생한다", () => {
    expect(() => {
      new Product("콜라", 0, 10, "탄산2+1");
    }).toThrow("[ERROR]");
  });

  test("수량이 음수인 경우 예외가 발생한다", () => {
    expect(() => {
      new Product("콜라", 1000, -1, "탄산2+1");
    }).toThrow("[ERROR]");
  });
});
