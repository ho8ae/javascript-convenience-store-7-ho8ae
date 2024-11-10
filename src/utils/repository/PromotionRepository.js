import { readFileSync } from "fs";
import Promotion from "../../domain/Promotion.js";

class PromotionRepository {
  #filePath = "public/promotions.md";
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
      const content = readFileSync(path, "utf8");
      const lines = content
        .split("\n")
        .slice(1)
        .filter((line) => line.trim());

      this.#promotions = lines.map((line) => {
        const [name, buy, get, startDate, endDate] = line
          .split(",")
          .map((item) => item.trim());
        return new Promotion(name, buy, get, startDate, endDate);
      });

      return this.#promotions;
    } catch (error) {
      if (error.message.startsWith("[ERROR]")) throw error;
      throw new Error("[ERROR] 프로모션 정보를 불러오는데 실패했습니다.");
    }
  }

  findPromotion(promotionName) {
    return this.#promotions.find(
      (promotion) => promotion.name === promotionName,
    );
  }

  getPromotions() {
    return this.#promotions;
  }
}

export default PromotionRepository;
