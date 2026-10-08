# 어디서 먹고 자지? — 전국 맛집·숙소·휴게소 10초 기록 PWA

전국 출장·외근이 잦은 사람을 위한 모바일 기록 앱입니다. 현장에서 10초 만에 식당·숙소·고속도로 휴게소를 기록하고,
다음에 그 지역에 갔을 때 바로 꺼내 봅니다. 로그인 없이 **이 기기(IndexedDB)에만 저장**되고, 인터넷이 없어도 열립니다.

## 기능

- **지역 필터**: 17개 시·도 → 시/군/구 2단계 선택, 최근 기록한 지역은 상단 칩으로 원터치
- **검색**: 상호명·메뉴·메모·주소·태그 실시간 검색 (띄어쓰기로 여러 단어 AND 검색)
- **탭**: 전체 / 맛집 / 숙소 / 휴게소
- **입력 폼**: 필수는 상호명뿐. 별점·재방문 의사·가격 프리셋·태그가 모두 원터치
  - 식당: 대표 메뉴, 1인 가격, 혼밥/아침 토글, 주차 가능 등 태그
  - 숙소: 1박 비용(실결제/비수기/성수기), 주차 편함·침구 깨끗·수압 좋음 등 시설 칩, 룸 타입
  - 주소를 입력하면 시·도/시·군·구 **자동 인식** (예: "부산 해운대구 우동…" → 부산 해운대구)
  - 카카오맵/네이버 지도 검색 버튼 + 지도 공유 링크 저장
  - 휴게소: 전국 고속도로 휴게소 208곳(노선·방향별) 검색, **지금 위치에서 가까운 휴게소** 자동 정렬,
    목록에 없는 곳은 직접 입력. 먹은 메뉴(호두과자·우동 등 원터치 + 가격)와 합계, 같은 휴게소에서 전에 먹은 메뉴 다시 넣기
- **카드 목록**: 지역별 그룹, 최근 방문순 / 추천·별점순 정렬, 카드에서 바로 카카오맵·네이버지도 길찾기
- **백업/복원**: JSON 내보내기·가져오기 (합치기 또는 교체), 마지막 백업일 표시
- **다크 모드**: 시스템 / 라이트 / 다크
- **PWA**: 홈 화면 설치, 오프라인 실행, 새 버전 자동 갱신

## 실행

```bash
npm install
npm run dev        # http://localhost:5173 (같은 와이파이의 휴대폰에서도 접속 가능)
npm run build      # dist/ 에 배포용 빌드
npm run preview    # 빌드 결과 미리보기 (서비스워커 동작 확인용)
```

## 구조

```
src/
  App.tsx                    화면 전체: 상단 필터·검색·탭, 목록, 바텀 내비, 시트 연결
  types.ts                   Place(기록) 데이터 타입
  data/regions.ts            17개 시·도 + 시/군/구 목록, 주소 → 지역 자동 인식
  data/restAreas.ts          전국 고속도로 휴게소 목록(한국도로공사 공공데이터 기반)
  data/tags.ts               식당/숙소 태그, 가격 프리셋
  lib/db.ts                  IndexedDB 저장 (실패 시 localStorage 자동 대체), 영구 보관 요청
  lib/backup.ts              JSON 내보내기/가져오기/병합
  lib/maps.ts                카카오맵·네이버지도 링크
  lib/format.ts, prefs.ts    가격 표시, 화면 설정, 테마
  components/
    PlaceForm.tsx            입력/수정 폼
    PlaceCard.tsx            목록 카드
    PlaceDetail.tsx          상세 시트 (길찾기, 수정, 삭제)
    RegionPicker.tsx         지역 선택 시트
    RestPicker.tsx           휴게소 검색·가까운 휴게소 선택 시트
    SettingsView.tsx         설정·백업·설치 안내
    ui.tsx                   공용 시트·칩·토글·별점
public/icons/                앱 아이콘 (svg, 192/512, maskable, apple-touch)
vite.config.ts               Vite + Tailwind + PWA(manifest·서비스워커) 설정
.github/workflows/deploy.yml main 에 push 하면 GitHub Pages 자동 배포
```

## PWA (manifest · 서비스워커)

`vite-plugin-pwa`가 빌드할 때 자동으로 만듭니다. 따로 등록 코드를 쓸 필요가 없습니다.

- `manifest.webmanifest`: `vite.config.ts`의 `manifest` 항목에서 이름·색상·아이콘 수정
- 서비스워커(`sw.js`): 빌드된 모든 파일을 미리 캐시 → 오프라인 실행
- 등록: `registerSW.js`가 `index.html`에 자동 삽입됨 (`injectRegister: 'script'`)
- 업데이트: `registerType: 'autoUpdate'` — 새 버전을 배포하면 다음 실행 때 자동 반영
- 서비스워커는 **HTTPS 또는 localhost**에서만 동작합니다 (GitHub Pages는 HTTPS)

### 휴대폰에 설치

- **아이폰**: Safari로 배포 주소 열기 → 공유 버튼 → **홈 화면에 추가**
- **안드로이드**: 크롬 메뉴(⋮) → **앱 설치** 또는 **홈 화면에 추가**

## 배포 (GitHub Pages)

1. 저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 설정 (처음 한 번)
2. `main` 브랜치에 push 하면 `.github/workflows/deploy.yml`이 빌드·배포
3. 주소: `https://<계정>.github.io/<저장소이름>/`

GitHub 웹에서 파일을 직접 고치고 커밋해도 같은 방식으로 자동 배포됩니다.

## 데이터 안전

- 기록은 브라우저 IndexedDB에 저장되고, 앱 시작 시 `navigator.storage.persist()`로 영구 보관을 요청합니다.
- 아이폰은 홈 화면에 추가한 앱으로 쓰는 것이 가장 안전합니다 (Safari 탭과 저장소가 분리됨).
- 기기 변경·초기화에 대비해 **설정 → 내보내기**로 가끔 백업 파일을 저장하세요.
