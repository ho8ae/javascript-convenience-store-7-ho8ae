class Promotion {
  #name;
  #buy;
  #get;
  #startDate;
  #endDate;

  constructor(name, buy, get, startDate, endDate) {
    this.validatePromotion(name, buy, get, startDate, endDate);
    this.#name = name;
    this.#buy = Number(buy);
    this.#get = Number(get);
    this.#startDate = startDate;
    this.#endDate = endDate;
  }

  get name() {
    return this.#name;
  }

  get buy() {
    return this.#buy;
  }

  get get() {
    return this.#get;
  }

  get startDate() {
    return this.#startDate;
  }

  get endDate() {
    return this.#endDate;
  }

  validatePromotion(name, buy, get, startDate, endDate) {
    if (!name || name.trim() === "") {
      throw new Error("[ERROR] 프로모션명은 필수입니다.");
    }
    if (isNaN(buy) || buy <= 0) {
      throw new Error("[ERROR] 구매 수량은 0보다 커야 합니다.");
    }
    if (isNaN(get) || get <= 0) {
      throw new Error("[ERROR] 증정 수량은 0보다 커야 합니다.");
    }
    if (!this.isValidDateFormat(startDate) || !this.isValidDateFormat(endDate)) {
      throw new Error("[ERROR] 날짜 형식이 올바르지 않습니다.");
    }
  }

  isValidDateFormat(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(dateString);
  }
}

export default Promotion;