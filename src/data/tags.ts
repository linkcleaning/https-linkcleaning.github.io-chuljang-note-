export const FOOD_TAGS = ['주차 가능', '포장 가능', '단체석', '24시간', '현지인 맛집', '웨이팅 있음', '카드 가능', '화물차 주차'];

export const STAY_TAGS = [
  '주차 편함',
  '침구 깨끗',
  '수압 좋음',
  '엘리베이터 있음',
  '담배 냄새 없음',
  '조식 제공',
  '방음 좋음',
  '와이파이 빠름',
  '세탁기 있음',
  '근처 식당 많음',
  '무인 체크인',
  '늦은 체크인 OK',
];

export const CAFE_TAGS = ['콘센트 많음', '와이파이 빠름', '조용함', '주차 가능', '디저트 맛집', '커피 맛집', '뷰 좋음', '테이크아웃', '24시간', '노키즈'];

export const REST_TAGS = ['화장실 깨끗', '주차 넉넉', '전기차 충전', '주유소', 'LPG 충전', '수면실', '샤워실', '화물차 라운지', '편의점', '흡연실 분리'];

/** 휴게소 단골 메뉴 — 탭하면 먹은 메뉴에 바로 추가 */
export const REST_FOOD_PRESETS = ['호두과자', '우동', '라면', '돈가스', '국밥', '비빔밥', '김밥', '소떡소떡', '핫바', '알감자', '커피', '떡꼬치'];

export const STAY_PRICE_TYPE_LABEL = {
  paid: '실결제',
  off: '비수기',
  peak: '성수기',
} as const;

export const REVISIT_LABEL = {
  yes: '적극 추천',
  soso: '보통',
  no: '비추천',
} as const;

export const FOOD_PRICE_PRESETS = [8000, 10000, 12000, 15000, 20000, 30000];
export const CAFE_PRICE_PRESETS = [3000, 4500, 5500, 6500, 8000, 12000];
export const STAY_PRICE_PRESETS = [40000, 50000, 60000, 80000, 100000, 150000];
