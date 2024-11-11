export const VIEW_MESSAGES = {
    Welcome: '안녕하세요. W편의점입니다.',
    CurrentProducts: '현재 보유하고 있는 상품입니다.\n',
    PurchaseInput: '구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n',
    MembershipInput: '멤버십 할인을 받으시겠습니까? (Y/N)\n',
    AdditionalPurchase: '감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)\n',
    PromotionWarning: (name, quantity) => 
      `현재 ${name} ${quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`,
    PromotionAdd: (name) => 
      `현재 ${name}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`
  };
  
  export const RECEIPT_TEMPLATE = {
    Header: '==============W 편의점================',
    ProductHeader: '상품명\t\t수량\t금액',
    FreeItemsHeader: '=============증\t정===============',
    Footer: '====================================',
    TotalAmount: '총구매액',
    PromotionDiscount: '행사할인',
    MembershipDiscount: '멤버십할인',
    FinalAmount: '내실돈'
  };