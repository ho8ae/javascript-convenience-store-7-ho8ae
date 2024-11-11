import { readFileSync } from "fs";
import Promotion from "../../domain/Promotion.js";
import {
  FILE_PATHS,
  ERROR_MESSAGES,
  STRING_PATTERNS,
  NUMBERS,
} from "../../constants/index.js";

class PromotionRepository {
  #filePath = FILE_PATHS.Promotions;
  static #instance = null;
  #promotions = [];

  constructor() {
    if (PromotionRepository.#instance) {
      return PromotionRepository.#instance;
    }
    PromotionRepository.#instance = this;
    this.loadPromotions();
  }

  loadPromotions(path = this.#filePath) {
    try {
      const content = readFileSync(path, STRING_PATTERNS.FileEncoding);
      const lines = content
        .split(STRING_PATTERNS.NewLine)
        .slice(NUMBERS.One)
        .filter((line) => line.trim());

      this.#promotions = lines.map((line) => {
        const [name, buy, get, startDate, endDate] = line
          .split(STRING_PATTERNS.Comma)
          .map((item) => item.trim());
        return new Promotion(name, buy, get, startDate, endDate);
      });

      return this.#promotions;
    } catch (error) {
      if (error.message.startsWith(STRING_PATTERNS.ErrorPrefix)) throw error;
      throw new Error(ERROR_MESSAGES.LoadPromotionFail);
    }
  }

  findPromotion(promotionName) {
    return this.#promotions.find(
      (promotion) => promotion.name === promotionName,
    );
  }
}

export default PromotionRepository;
