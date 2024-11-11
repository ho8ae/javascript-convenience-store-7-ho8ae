# javascript-convenience-store-precourse

# 🏪 편의점 미션

## 🎯 구현할 기능 목록

### 1. 데이터 파일 처리
- [x] Products.md 파일 파싱
 - [x] 상품명, 가격, 수량, 프로모션 정보 파싱
 - [x] 동일 상품의 프로모션/일반 재고 구분
 
- [x] Promotions.md 파일 파싱
 - [x] 프로모션명, 구매수량, 증정수량, 시작일, 종료일 파싱
 - [x] 프로모션 유효기간 검증 로직 구현

### 2. 상품 초기화 및 출력
- [x] 상품 목록 출력 (상품명, 가격, 재고, 행사정보)
 - [x] 재고가 0개인 경우 "재고 없음" 표시
 - [x] 금액 출력 시 천 단위 콤마(,) 포맷팅
 - [x] 동일 상품 구분하여 출력 (프로모션/일반)

### 3. 상품 구매 입력 및 검증
- [x] 상품 구매 입력 처리 ([상품명-수량] 형식)
- [x] 입력값 유효성 검증
  - [x] 올바른 형식인지 검증
    - [x] 대괄호 포함 확인
    - [x] 하이픈 포함 확인
  - [x] 상품명이 비어있지 않은지 검증
  - [x] 수량이 양의 정수인지 검증
  - [x] 존재하는 상품인지 검증
  - [x] 재고 수량 초과 여부 검증

### 4. 프로모션 할인 처리
- [x] 프로모션 종류별 처리
 - [x] 탄산2+1: 2개 구매시 1개 증정
 - [x] MD추천상품: 1개 구매시 1개 증정
 - [x] 반짝할인: 특정 기간 적용
- [x] 프로모션 적용 가능 여부 확인
 - [x] N+1 프로모션 조건 충족 확인
 - [x] 프로모션 재고 확인
- [x] 추가 구매 안내 메시지 출력
- [x] 프로모션 미적용 수량 안내 및 처리

### 5. 멤버십 할인 처리
- [x] 멤버십 할인 계산 기능
 - [x] 프로모션 미적용 금액의 30% 할인 계산
 - [x] 최대 할인한도(8,000원) 적용
- [x] 멤버십 할인 적용 여부 입력 받기
- [x] Y/N 입력값 검증
- [x] 프로모션 미적용 금액의 30% 할인 계산
- [x] 최대 할인한도(8,000원) 적용

### 6. 결제 및 영수증 출력
- [x] 구매 내역 출력 (상품명, 수량, 금액)
 - [x] 금액 천 단위 콤마(,) 포맷팅
 - [x] 정렬 및 여백 처리
- [x] 증정 상품 내역 출력
- [x] 금액 정보 출력
 - [x] 총구매액 계산 및 출력
 - [x] 행사할인 금액 계산 및 출력
 - [x] 멤버십할인 금액 계산 및 출력
 - [x] 최종 결제 금액 계산 및 출력

### 7. 재고 관리
- [x] 구매 수량만큼 재고 차감
- [x] 프로모션 재고와 일반 재고 구분 관리
- [x] 재고 업데이트 후 상태 관리

### 8. 추가 구매 처리
- [x] 추가 구매 여부 입력 받기 (Y/N)
 - [x] Y/N 입력값 검증
- [x] 업데이트된 재고 상태로 상품 목록 출력

### 9. 에러 처리 및 재입력
- [v] "[ERROR]" 프리픽스로 에러 메시지 출력
- [v] 에러 발생 지점부터 재입력 받기
- [v] 각 단계별 적절한 에러 메시지 출력

## ❌ 예외 상황 처리

### 입력값 예외
- [x] 상품 입력 형식이 올바르지 않은 경우
 - [x] 대괄호 누락/잘못된 위치
 - [x] 하이픈 누락/잘못된 위치
 - [x] 쉼표 누락/잘못된 위치
- [x] 존재하지 않는 상품을 입력한 경우
- [x] 구매 수량이 재고 수량을 초과한 경우
- [x] 상품명이 비어있는 경우
- [x] 수량이 양의 정수가 아닌 경우
 - [x] 0 또는 음수 입력
 - [x] 소수점 입력
 - [x] 문자열 입력
- [x] Y/N 입력값이 올바르지 않은 경우
- [x] 동일 상품 중복 입력한 경우

### 재고 관련 예외
- [x] 프로모션 재고가 부족한 경우
- [x] 일반 재고가 부족한 경우
- [x] 재고가 0인 상품 주문 시도

### 프로모션 관련 예외
- [x] 프로모션 기간이 아닌 경우
- [x] 프로모션 적용 조건을 만족하지 않는 경우
- [x] 프로모션 중복 적용 시도

### 출력 포맷 예외
- [x] 금액이 천 단위를 초과할 경우 콤마 처리
- [x] 동일 상품명 출력 시 구분
- [x] 영수증 출력 시 정렬/여백 처리

### 파일 데이터 예외
- [x] 파일을 불러오지 못하는 경우
- [x] 상품명이 없는 경우
- [x] 가격이 0 보다 큰 숫자가 아닌 경우
- [x] 수량이 0 이상의 숫자여야 하는 경우

## 🔍 테스트 케이스

### 기본 기능 테스트
- [x] 파일에 있는 상품 목록 출력 테스트
- [x] 여러 개의 일반 상품 구매 테스트
- [x] 기간에 해당하지 않는 프로모션 적용 테스트
- [x] 재고 수량 초과 예외 테스트

### 프로모션 테스트
- [x] 2+1 프로모션 정상 적용 테스트
- [x] MD추천상품 1+1 프로모션 정상 적용 테스트
- [x] 반짝할인 기간 내 구매 테스트
- [x] 프로모션 중복 적용 불가 테스트
  
### 멤버십 할인 테스트
- [x] 멤버십 할인 계산 기능
  - [x] 프로모션 미적용 금액의 30% 할인 계산
  - [x] 최대 할인한도(8,000원) 적용
  - [x] 0원 주문 예외 처리
  - [x] 멤버십 미적용 처리

### 파일 데이터 테스트
- [x] Products.md 파일 파싱 테스트
- [x] Promotions.md 파일 파싱 테스트
- [x] 잘못된 형식의 데이터 예외처리 테스트

### 입력값 검증 테스트
- [x] 잘못된 형식의 입력 테스트
- [x] 존재하지 않는 상품 입력 테스트
- [x] 재고 수량보다 많은 입력 테스트
- [x] 기타 잘못된 입력 테스트
  - [x] 소수점/음수/문자열 수량 입력 테스트
- [x] Y/N 이외의 값 입력 테스트

### 재고 관리 테스트
- [x] 재고 차감 정상 동작 테스트
- [x] 프로모션/일반 재고 구분 테스트
- [x] 재고 부족 시 처리 테스트

### 금액 계산 테스트
- [x] 프로모션 할인 계산 테스트
- [x] 멤버십 할인 계산 테스트
- [x] 최대 할인 한도 적용 테스트
  
### 영수증 출력 테스트
- [x] 구매내역 정상 작동 테스트
- [x] 증점 상품 영수증 포함되는지 테스트
- [x] 할인 금액 정상 작동 테스트
- [x] 금액이 천 단위로 포맷팅 되는지 테스트

### 입출력 처리 테스트 
- [x] InputView 테스트
- [x] OutputView 테스트

## 📋 프로그래밍 요구 사항
- indent depth ≤ 2
- 함수 길이 ≤ 10 lines
- 3항 연산자 사용 금지
- else 예약어 사용 지양
- Jest 테스트 구현
- MVC 패턴 적용