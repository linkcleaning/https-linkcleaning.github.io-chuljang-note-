// 전국 17개 시·도 및 시/군/구 (2026년 행정구역 기준)
// name: 화면 표시용 짧은 이름, full: 정식 명칭, aliases: 주소 자동 인식용

export interface Sido {
  name: string;
  full: string;
  aliases: string[];
  sigungu: string[];
}

export const SIDO_LIST: Sido[] = [
  {
    name: '서울', full: '서울특별시', aliases: ['서울특별시', '서울시', '서울'],
    sigungu: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  },
  {
    name: '부산', full: '부산광역시', aliases: ['부산광역시', '부산시', '부산'],
    sigungu: ['해운대구', '수영구', '부산진구', '동래구', '남구', '중구', '서구', '동구', '영도구', '북구', '사하구', '금정구', '강서구', '연제구', '사상구', '기장군'],
  },
  {
    name: '대구', full: '대구광역시', aliases: ['대구광역시', '대구시', '대구'],
    sigungu: ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군', '군위군'],
  },
  {
    name: '인천', full: '인천광역시', aliases: ['인천광역시', '인천시', '인천'],
    sigungu: ['제물포구', '영종구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '검단구', '강화군', '옹진군', '중구', '동구'],
  },
  {
    name: '광주', full: '광주광역시', aliases: ['광주광역시', '광주'], // 경기 광주시는 '경기 광주시'로 인식
    sigungu: ['동구', '서구', '남구', '북구', '광산구'],
  },
  {
    name: '대전', full: '대전광역시', aliases: ['대전광역시', '대전시', '대전'],
    sigungu: ['동구', '중구', '서구', '유성구', '대덕구'],
  },
  {
    name: '울산', full: '울산광역시', aliases: ['울산광역시', '울산시', '울산'],
    sigungu: ['중구', '남구', '동구', '북구', '울주군'],
  },
  {
    name: '세종', full: '세종특별자치시', aliases: ['세종특별자치시', '세종시', '세종'],
    sigungu: ['세종시'],
  },
  {
    name: '경기', full: '경기도', aliases: ['경기도', '경기'],
    sigungu: ['수원시', '성남시', '고양시', '용인시', '화성시', '부천시', '안산시', '안양시', '남양주시', '평택시', '의정부시', '시흥시', '파주시', '김포시', '광명시', '광주시', '군포시', '하남시', '오산시', '이천시', '안성시', '의왕시', '양주시', '구리시', '포천시', '여주시', '동두천시', '과천시', '양평군', '가평군', '연천군'],
  },
  {
    name: '강원', full: '강원특별자치도', aliases: ['강원특별자치도', '강원도', '강원'],
    sigungu: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
  },
  {
    name: '충북', full: '충청북도', aliases: ['충청북도', '충북'],
    sigungu: ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
  },
  {
    name: '충남', full: '충청남도', aliases: ['충청남도', '충남'],
    sigungu: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
  },
  {
    name: '전북', full: '전북특별자치도', aliases: ['전북특별자치도', '전라북도', '전북'],
    sigungu: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
  },
  {
    name: '전남', full: '전라남도', aliases: ['전라남도', '전남'],
    sigungu: ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
  },
  {
    name: '경북', full: '경상북도', aliases: ['경상북도', '경북'],
    sigungu: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
  },
  {
    name: '경남', full: '경상남도', aliases: ['경상남도', '경남'],
    sigungu: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
  },
  {
    name: '제주', full: '제주특별자치도', aliases: ['제주특별자치도', '제주도', '제주'],
    sigungu: ['제주시', '서귀포시'],
  },
];

export const findSido = (name: string) => SIDO_LIST.find((s) => s.name === name);

/** "부산 해운대구" 형태 표시용 */
export const regionLabel = (sido: string, sigungu: string) =>
  [sido, sigungu].filter(Boolean).join(' ') || '지역 미지정';

/** 시군구 이름에서 접미사(시/군/구)를 뗀 짧은 형태: 해운대구 → 해운대 */
const stem = (s: string) => (s.length > 2 ? s.replace(/(시|군|구)$/, '') : s);

/**
 * 주소/텍스트에서 시도·시군구 자동 인식.
 * "부산 해운대구 우동 123" → { sido: '부산', sigungu: '해운대구' }
 * "서귀포시 중문동"          → { sido: '제주', sigungu: '서귀포시' } (전국에서 유일한 이름이면 시도도 추정)
 */
export function detectRegion(text: string): { sido: string; sigungu: string } | null {
  const tokens = text.replace(/[(),]/g, ' ').split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  let sido: Sido | undefined;
  for (const t of tokens.slice(0, 3)) {
    sido = SIDO_LIST.find((s) => s.aliases.includes(t));
    if (sido) break;
  }

  const matchIn = (list: string[]) => {
    for (const t of tokens) {
      const hit = list.find((g) => g === t || (stem(g) === t && t.length >= 2));
      if (hit) return hit;
    }
    return '';
  };

  if (sido) {
    return { sido: sido.name, sigungu: matchIn(sido.sigungu) };
  }

  // 시도가 없으면, 전국에서 유일한 시군구 이름일 때만 추정
  for (const t of tokens) {
    const hits = SIDO_LIST.flatMap((s) =>
      s.sigungu.filter((g) => g === t || (stem(g) === t && t.length >= 2)).map((g) => ({ sido: s.name, sigungu: g })),
    );
    if (hits.length === 1) return hits[0];
  }
  return null;
}
