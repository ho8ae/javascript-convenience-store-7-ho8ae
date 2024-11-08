import { readFileSync } from "fs";
import Promotion from "../../domain/Promotion.js";

class PromotionRepository {
  #filePath = "public/promotions.md";

  loadPromotions(path = this.#filePath) {
    try {
      const content = readFileSync(path, "utf8");
      const lines = content.split("\n").slice(1); // 헤더 제외

      return lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [name, buy, get, startDate, endDate] = line
            .split(",")
            .map((item) => item.trim());
          return new Promotion(name, buy, get, startDate, endDate);
        });
    } catch (error) {
      if (error.message.startsWith("[ERROR]")) {
        throw error;
      }
      throw new Error("[ERROR] 프로모션 정보를 불러오는데 실패했습니다.");
    }
  }

  findPromotion(promotionName) {
    const promotions = this.loadPromotions();
    return promotions.find((promotion) => promotion.name === promotionName);
  }
  
}

export default PromotionRepository;
