export const FILE_PATHS = Object.freeze({
    Products: 'public/products.md',
    Promotions: 'public/promotions.md'
  });
  
export const INPUTS = Object.freeze({
  Yes: 'Y',
  No: 'N',
  ProductPattern: /^\[([^\-\]]+)-([1-9]\d*)\]$/
});
  
export const VALIDATION = Object.freeze({
  DateFormat: /^\d{4}-\d{2}-\d{2}$/
});
  
export const DISPLAY = Object.freeze({
  OutOfStock: '재고 없음',
  StockUnit: '개'
});
