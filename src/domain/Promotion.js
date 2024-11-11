import { 
  ERROR_MESSAGES, 
  STRING_PATTERNS, 
  NUMBERS 
} from '../constants/index.js';

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
    if (!name || name.trim() === STRING_PATTERNS.Empty) {
      throw new Error(ERROR_MESSAGES.PromotionNameRequired);
    }
    if (isNaN(buy) || buy <= NUMBERS.Zero) {
      throw new Error(ERROR_MESSAGES.InvalidBuyCount);
    }
    if (isNaN(get) || get <= NUMBERS.Zero) {
      throw new Error(ERROR_MESSAGES.InvalidGetCount);
    }
    if (!STRING_PATTERNS.DateFormatRegex.test(startDate) || 
        !STRING_PATTERNS.DateFormatRegex.test(endDate)) {
      throw new Error(ERROR_MESSAGES.InvalidDateFormat);
    }
  }

  isValidDateFormat(dateString) {
    return STRING_PATTERNS.DateFormatRegex.test(dateString);
  }
}

export default Promotion;