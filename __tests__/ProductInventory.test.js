import ProductInventory from '../../src/domain/ProductInventory.js';

describe('ProductInventory 테스트', () => {
    let inventory;

    beforeEach(() => {
        inventory = new ProductInventory();
    });

    test('상품 구매 시 재고가 정상적으로 차감된다', () => {
        const items = [{ name: '콜라', quantity: 2 }];
        
        inventory.decreaseStock(items);
        const updatedStock = inventory.getStock('콜라');
        
        expect(updatedStock).toBe(8);  // 10 - 2
    });

    test('프로모션 재고와 일반 재고가 구분되어 관리된다', () => {
        const items = [{ name: '콜라', quantity: 3 }];  // 2+1 프로모션
        
        inventory.decreaseStock(items, true);  // 프로모션 적용
        
        const promotionStock = inventory.getPromotionStock('콜라');
        const normalStock = inventory.getNormalStock('콜라');
        
        expect(promotionStock).toBe(7);  // 10 - 3
        expect(normalStock).toBe(10);    // 변동 없음
    });

    test('재고가 부족한 경우 예외가 발생한다', () => {
        const items = [{ name: '콜라', quantity: 15 }];
        
        expect(() => {
            inventory.decreaseStock(items);
        }).toThrow('[ERROR] 재고 수량을 초과하여 구매할 수 없습니다.');
    });

    test('재고가 0인 상품은 재고 없음으로 표시된다', () => {
        const items = [{ name: '콜라', quantity: 10 }];
        inventory.decreaseStock(items);
        
        const stockInfo = inventory.getStockInfo('콜라');
        expect(stockInfo).toBe('재고 없음');
    });
});