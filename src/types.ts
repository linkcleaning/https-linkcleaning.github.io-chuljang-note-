export type Category = 'food' | 'stay' | 'rest';
export type Revisit = 'yes' | 'soso' | 'no';
export type StayPriceType = 'paid' | 'off' | 'peak';

export interface Dish {
  name: string;
  price: number | null;
}

export interface Place {
  id: string;
  category: Category;
  name: string;
  sido: string;
  sigungu: string;
  address: string;
  mapUrl: string; // 네이버/카카오 지도 공유 링크(선택)
  rating: number; // 0(미평가) ~ 5
  revisit: Revisit;
  memo: string;
  tags: string[]; // 식당: 주차 가능 등 / 숙소: 시설·컨디션 태그
  visitedAt: string; // YYYY-MM-DD

  // 식당 전용
  menu: string;
  pricePerPerson: number | null;
  solo: boolean; // 혼밥 가능
  breakfast: boolean; // 아침식사 가능

  // 숙소 전용
  stayPrice: number | null;
  stayPriceType: StayPriceType;
  roomType: string;

  // 휴게소 전용
  restId: string; // 휴게소 목록 id ('' = 직접 입력)
  route: string; // 고속도로 노선
  dishes: Dish[]; // 먹은 메뉴

  createdAt: number;
  updatedAt: number;
}

export type Tab = 'all' | 'food' | 'stay' | 'rest';

export interface RegionFilter {
  sido: string; // '' = 전국
  sigungu: string; // '' = 시도 전체
}
