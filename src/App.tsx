import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDownWideNarrow,
  BedDouble,
  ChevronDown,
  Clock,
  List,
  MapPin,
  Plus,
  Search,
  Settings,
  Signpost,
  Star,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import type { Category, Place, RegionFilter, Tab } from './types';
import { regionLabel } from './data/regions';
import { clearPlaces, deletePlace, getAllPlaces, putPlace, putPlaces, requestPersist } from './lib/db';
import { applyTheme, usePref, type Theme } from './lib/prefs';
import { PlaceCard, keyTags } from './components/PlaceCard';
import { PlaceDetail } from './components/PlaceDetail';
import { PlaceForm } from './components/PlaceForm';
import { RegionPicker } from './components/RegionPicker';
import { SettingsView } from './components/SettingsView';

type View = 'list' | 'settings';
type Sort = 'recent' | 'rating';

const SUGGESTED_REGIONS: RegionFilter[] = [
  { sido: '제주', sigungu: '서귀포시' },
  { sido: '부산', sigungu: '해운대구' },
  { sido: '서울', sigungu: '강남구' },
];

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>('list');

  const [tab, setTab] = usePref<Tab>('cn.tab', 'all');
  const [region, setRegion] = usePref<RegionFilter>('cn.region', { sido: '', sigungu: '' });
  const [lastRegion, setLastRegion] = usePref<RegionFilter>('cn.lastRegion', { sido: '', sigungu: '' });
  const [sort, setSort] = usePref<Sort>('cn.sort', 'recent');
  const [query, setQuery] = useState('');

  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('cn.theme') as Theme) || 'system';
    } catch {
      return 'system';
    }
  });

  const [regionOpen, setRegionOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [detail, setDetail] = useState<Place | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);

  const toast = useCallback((m: string) => {
    setToastMsg(m);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(''), 2200);
  }, []);

  // 초기 로드 + 영구 보관 요청
  useEffect(() => {
    getAllPlaces()
      .then((list) => setPlaces(list))
      .catch(() => toast('기록을 불러오지 못했어요'))
      .finally(() => setLoaded(true));
    requestPersist();
  }, [toast]);

  // 테마 적용 (시스템 모드는 OS 변경을 따라감)
  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = () => applyTheme('system');
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [theme]);

  // ---- 데이터 변경 ----
  const savePlace = async (p: Place) => {
    const exists = places.some((x) => x.id === p.id);
    setPlaces((list) => (exists ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list]));
    setLastRegion({ sido: p.sido, sigungu: p.sigungu });
    setFormOpen(false);
    setEditing(null);
    if (detail?.id === p.id) setDetail(p);
    try {
      await putPlace(p);
      toast(exists ? '수정했어요' : `'${p.name}' 저장 완료`);
    } catch {
      toast('저장 실패 — 저장공간을 확인해 주세요');
    }
  };

  const removePlace = async (p: Place) => {
    setPlaces((list) => list.filter((x) => x.id !== p.id));
    setDetail(null);
    await deletePlace(p.id);
    toast('삭제했어요');
  };

  const replaceAll = async (list: Place[]) => {
    await clearPlaces();
    if (list.length) await putPlaces(list);
    setPlaces(list);
  };

  // ---- 파생 데이터 ----
  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of places) {
      if (!p.sido) continue;
      c[p.sido] = (c[p.sido] ?? 0) + 1;
      if (p.sigungu) c[`${p.sido} ${p.sigungu}`] = (c[`${p.sido} ${p.sigungu}`] ?? 0) + 1;
    }
    return c;
  }, [places]);

  // 최근 기록한 지역 (빠른 선택 칩)
  const quickRegions = useMemo(() => {
    const seen = new Set<string>();
    const out: RegionFilter[] = [];
    for (const p of [...places].sort((a, b) => b.updatedAt - a.updatedAt)) {
      if (!p.sido) continue;
      const k = `${p.sido}|${p.sigungu}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ sido: p.sido, sigungu: p.sigungu });
      if (out.length >= 8) break;
    }
    for (const r of SUGGESTED_REGIONS) {
      if (out.length >= 4) break;
      const k = `${r.sido}|${r.sigungu}`;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(r);
      }
    }
    return out;
  }, [places]);

  const regionFiltered = useMemo(
    () =>
      places.filter(
        (p) => (!region.sido || p.sido === region.sido) && (!region.sigungu || p.sigungu === region.sigungu),
      ),
    [places, region],
  );

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return regionFiltered;
    const words = q.split(/\s+/);
    return regionFiltered.filter((p) => {
      const hay = [p.name, p.menu, p.memo, p.address, p.roomType, p.sido, p.sigungu, p.route, ...p.dishes.map((d) => d.name), ...keyTags(p)]
        .join(' ')
        .toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [regionFiltered, query]);

  const tabCounts = {
    all: searched.length,
    food: searched.filter((p) => p.category === 'food').length,
    stay: searched.filter((p) => p.category === 'stay').length,
    rest: searched.filter((p) => p.category === 'rest').length,
  };

  const visible = useMemo(() => {
    const list = tab === 'all' ? searched : searched.filter((p) => p.category === tab);
    const revisitRank = { yes: 0, soso: 1, no: 2 } as const;
    return [...list].sort((a, b) =>
      sort === 'rating'
        ? revisitRank[a.revisit] - revisitRank[b.revisit] || b.rating - a.rating || b.updatedAt - a.updatedAt
        : (b.visitedAt || '').localeCompare(a.visitedAt || '') || b.updatedAt - a.updatedAt,
    );
  }, [searched, tab, sort]);

  // 지역별 그룹 (최근 활동한 지역이 위로)
  const groups = useMemo(() => {
    const m = new Map<string, { label: string; items: Place[]; latest: number }>();
    for (const p of visible) {
      const label = regionLabel(p.sido, p.sigungu);
      const g = m.get(label) ?? { label, items: [], latest: 0 };
      g.items.push(p);
      g.latest = Math.max(g.latest, p.updatedAt);
      m.set(label, g);
    }
    return [...m.values()].sort((a, b) => b.latest - a.latest);
  }, [visible]);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const defaultCategory: Category = tab === 'all' ? 'food' : tab;
  const defaultRegion = region.sido ? region : lastRegion;
  const regionActive = !!region.sido;

  return (
    <div className="mx-auto min-h-dvh max-w-lg pb-28">
      {view === 'list' ? (
        <>
          {/* ===== 상단: 검색 · 지역 · 탭 ===== */}
          <header className="pt-safe sticky top-0 z-30 bg-stone-100/95 backdrop-blur dark:bg-stone-950/95">
            <div className="px-4 pt-3">
              <h1 className="mb-2 px-0.5 text-[19px] font-extrabold tracking-tight">
                어디서 먹고 자지<span className="text-brand-600">?</span>
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRegionOpen(true)}
                  className={`flex min-h-12 max-w-[46%] shrink-0 items-center gap-1 rounded-2xl px-3 text-[16px] font-bold active:scale-95 ${
                    regionActive
                      ? 'bg-brand-700 text-white'
                      : 'bg-white text-stone-800 ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-100 dark:ring-stone-800'
                  }`}
                >
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{regionActive ? regionLabel(region.sido, region.sigungu) : '전국'}</span>
                  <ChevronDown className="size-4 shrink-0 opacity-70" />
                </button>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="상호·메뉴·메모 검색"
                    className="min-h-12 w-full rounded-2xl bg-white pr-10 pl-10 text-[16px] ring-1 ring-stone-200 outline-none focus:ring-2 focus:ring-brand-600 dark:bg-stone-900 dark:ring-stone-800"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      aria-label="검색어 지우기"
                      className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center text-stone-400"
                    >
                      <X className="size-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 빠른 지역 칩 */}
              <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-0.5">
                {regionActive && (
                  <button
                    onClick={() => setRegion({ sido: '', sigungu: '' })}
                    className="flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-stone-800 px-3.5 text-sm font-semibold text-white dark:bg-stone-200 dark:text-stone-900"
                  >
                    <X className="size-4" /> 전국
                  </button>
                )}
                {quickRegions.map((r) => {
                  const active = r.sido === region.sido && r.sigungu === region.sigungu;
                  const n = regionCounts[r.sigungu ? `${r.sido} ${r.sigungu}` : r.sido] ?? 0;
                  return (
                    <button
                      key={`${r.sido}|${r.sigungu}`}
                      onClick={() => setRegion(active ? { sido: '', sigungu: '' } : r)}
                      className={`min-h-10 shrink-0 rounded-full px-3.5 text-sm font-semibold active:scale-95 ${
                        active
                          ? 'bg-brand-700 text-white'
                          : 'bg-white text-stone-700 ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-800'
                      }`}
                    >
                      {regionLabel(r.sido, r.sigungu)}
                      {n > 0 && <span className={`ml-1 ${active ? 'text-brand-100' : 'text-brand-600'}`}>{n}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 탭 */}
            <div className="mt-2 grid grid-cols-4 gap-1 px-4 pb-2.5">
              {(
                [
                  ['all', '전체', List, 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'],
                  ['food', '맛집', UtensilsCrossed, 'bg-food text-white'],
                  ['stay', '숙소', BedDouble, 'bg-stay text-white'],
                  ['rest', '휴게소', Signpost, 'bg-rest text-white'],
                ] as const
              ).map(([v, label, Icon, on]) => (
                <button
                  key={v}
                  onClick={() => setTab(v)}
                  className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-[14px] leading-tight font-bold transition ${
                    tab === v ? on : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Icon className="size-4" />
                    {label}
                  </span>
                  <span className="text-xs font-semibold opacity-70">{tabCounts[v]}</span>
                </button>
              ))}
            </div>
          </header>

          {/* ===== 목록 ===== */}
          <main className="px-4">
            {visible.length > 0 && (
              <div className="mt-1 mb-1 flex justify-end">
                <button
                  onClick={() => setSort(sort === 'recent' ? 'rating' : 'recent')}
                  className="flex min-h-10 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-stone-500"
                >
                  {sort === 'recent' ? <Clock className="size-4" /> : <Star className="size-4" />}
                  {sort === 'recent' ? '최근 방문순' : '추천·별점순'}
                  <ArrowDownWideNarrow className="size-4" />
                </button>
              </div>
            )}

            {loaded && visible.length === 0 && (
              <Empty
                hasAny={places.length > 0}
                filtered={!!query || regionActive}
                onAdd={openNew}
                onReset={() => {
                  setQuery('');
                  setRegion({ sido: '', sigungu: '' });
                }}
              />
            )}

            {groups.map((g) => (
              <section key={g.label} className="mb-5">
                {(groups.length > 1 || !region.sigungu) && (
                  <h2 className="mb-2 flex items-center gap-1.5 px-1 text-[15px] font-extrabold text-stone-600 dark:text-stone-300">
                    <MapPin className="size-4 text-brand-600" />
                    {g.label}
                    <span className="font-semibold text-stone-400">{g.items.length}</span>
                  </h2>
                )}
                <div className="space-y-3">
                  {g.items.map((p) => (
                    <PlaceCard key={p.id} p={p} onOpen={() => setDetail(p)} />
                  ))}
                </div>
              </section>
            ))}
          </main>
        </>
      ) : (
        <>
          <header className="pt-safe sticky top-0 z-30 bg-stone-100/95 px-5 pt-4 pb-2 backdrop-blur dark:bg-stone-950/95">
            <h1 className="text-2xl font-extrabold">설정</h1>
          </header>
          <SettingsView
            places={places}
            theme={theme}
            setTheme={setThemeState}
            onReplaceAll={replaceAll}
            toast={toast}
          />
        </>
      )}

      {/* ===== 바텀 내비게이션 ===== */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
        <div className="mx-auto grid h-[68px] max-w-lg grid-cols-3 items-center">
          <NavBtn active={view === 'list'} onClick={() => setView('list')} icon={<List className="size-6" />} label="목록" />
          <div className="flex justify-center">
            <button
              onClick={openNew}
              aria-label="새 기록"
              className="-mt-7 flex size-[68px] flex-col items-center justify-center rounded-full bg-brand-700 text-white shadow-xl ring-4 shadow-brand-700/30 ring-stone-100 active:scale-95 dark:ring-stone-950"
            >
              <Plus className="size-8" strokeWidth={2.6} />
            </button>
          </div>
          <NavBtn
            active={view === 'settings'}
            onClick={() => setView('settings')}
            icon={<Settings className="size-6" />}
            label="설정·백업"
          />
        </div>
      </nav>

      {/* ===== 시트 / 토스트 ===== */}
      <RegionPicker
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        value={region}
        onSelect={setRegion}
        allowNationwide
        counts={regionCounts}
      />

      <PlaceForm
        open={formOpen}
        initial={editing}
        places={places}
        defaultCategory={editing?.category ?? defaultCategory}
        defaultRegion={defaultRegion}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={savePlace}
      />

      <PlaceDetail
        place={formOpen ? null : detail}
        onClose={() => setDetail(null)}
        onEdit={(p) => {
          setEditing(p);
          setFormOpen(true);
        }}
        onDelete={removePlace}
        toast={toast}
      />

      {toastMsg && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-6">
          <div className="animate-fade-in rounded-2xl bg-stone-900/90 px-5 py-3 text-[15px] font-semibold text-white shadow-lg dark:bg-stone-100/95 dark:text-stone-900">
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-full flex-col items-center justify-center gap-0.5 text-xs font-bold ${
        active ? 'text-brand-700 dark:text-brand-500' : 'text-stone-400'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Empty({
  hasAny,
  filtered,
  onAdd,
  onReset,
}: {
  hasAny: boolean;
  filtered: boolean;
  onAdd: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-14 flex flex-col items-center text-center">
      <div className="grid size-20 place-items-center rounded-3xl bg-white text-4xl shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
        {hasAny ? '🔍' : '🧳'}
      </div>
      <p className="mt-4 text-lg font-bold">{hasAny ? '조건에 맞는 기록이 없어요' : '첫 기록을 남겨 보세요'}</p>
      <p className="mt-1 text-[15px] whitespace-pre-line text-stone-500">
        {hasAny ? '다른 지역이나 검색어로 찾아보세요.' : '다녀온 식당·숙소를 10초 만에 저장하고\n다음 출장 때 바로 꺼내 보세요.'}
      </p>
      <div className="mt-5 flex gap-2">
        {hasAny && filtered && (
          <button onClick={onReset} className="min-h-12 rounded-2xl border border-stone-300 px-5 font-bold dark:border-stone-700">
            필터 초기화
          </button>
        )}
        <button onClick={onAdd} className="flex min-h-12 items-center gap-1.5 rounded-2xl bg-brand-700 px-5 font-bold text-white">
          <Plus className="size-5" /> 기록 추가
        </button>
      </div>
    </div>
  );
}
