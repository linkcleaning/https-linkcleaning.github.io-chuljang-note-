import type { Place } from '../types';

/** 지도 검색어: 주소가 있으면 "주소 상호명", 없으면 "시군구 상호명" */
export const mapQuery = (p: Pick<Place, 'name' | 'address' | 'sido' | 'sigungu'> & { category?: Place['category'] }) => {
  // 휴게소는 이름만으로 검색이 가장 정확: "기흥휴게소 (부산방향)" → "기흥휴게소 부산방향"
  if (p.category === 'rest') return p.name.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
  const where = p.address?.trim() || [p.sido, p.sigungu].filter(Boolean).join(' ');
  return [where, p.name].filter(Boolean).join(' ').trim();
};

// 모바일에서는 설치된 카카오맵/네이버지도 앱으로 넘어가고, 없으면 웹 지도로 열립니다.
export const kakaoMapUrl = (q: string) => `https://map.kakao.com/link/search/${encodeURIComponent(q)}`;
export const naverMapUrl = (q: string) => `https://map.naver.com/p/search/${encodeURIComponent(q)}`;

export const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
