// 휴게소 선택 시트: 이름 검색 · 노선 필터 · 현재 위치에서 가까운 휴게소
import { useEffect, useMemo, useState } from 'react';
import { Crosshair, Loader2, PencilLine, Search, Signpost } from 'lucide-react';
import { REST_AREAS, REST_ROUTES, distanceKm, type RestArea } from '../data/restAreas';
import { Sheet, inputCls } from './ui';

export function RestPicker({
  open,
  onClose,
  onPick,
  onCustom,
  visitedIds,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (r: RestArea) => void;
  onCustom: (name: string) => void; // 목록에 없는 휴게소 직접 입력
  visitedIds: Set<string>;
}) {
  const [q, setQ] = useState('');
  const [route, setRoute] = useState('');
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState('');

  useEffect(() => {
    if (open) {
      setQ('');
      setLocErr('');
    }
  }, [open]);

  const locate = () => {
    if (!navigator.geolocation) return setLocErr('이 기기에서는 위치를 쓸 수 없어요');
    setLocating(true);
    setLocErr('');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setRoute('');
        setQ('');
        setLocating(false);
      },
      () => {
        setLocErr('위치 권한을 허용해 주세요');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  const list = useMemo(() => {
    const words = q.trim().toLowerCase().replace(/휴게소/g, '').split(/\s+/).filter(Boolean);
    let l = REST_AREAS.filter((r) => {
      if (route && r.route !== route) return false;
      if (!words.length) return true;
      const hay = `${r.name} ${r.dir} ${r.route} ${r.sido} ${r.sigungu}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    if (pos && !q && !route) {
      l = l
        .filter((r) => r.lat)
        .map((r) => ({ r, d: distanceKm(pos.lat, pos.lng, r.lat, r.lng) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 12)
        .map((x) => x.r);
    }
    return l;
  }, [q, route, pos]);

  const nearMode = !!pos && !q && !route;

  return (
    <Sheet open={open} onClose={onClose} full title="휴게소 선택">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-stone-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="휴게소 이름·노선·지역 (예: 기흥, 경부 부산)"
          className={`${inputCls} pl-11 text-[16px]`}
        />
      </div>

      <button
        type="button"
        onClick={locate}
        className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rest/60 bg-green-50 text-[16px] font-bold text-green-800 active:scale-[0.98] dark:bg-green-950/40 dark:text-green-200"
      >
        {locating ? <Loader2 className="size-5 animate-spin" /> : <Crosshair className="size-5" />}
        지금 위치에서 가까운 휴게소
      </button>
      {locErr && <p className="mt-1.5 text-sm font-semibold text-rose-600">{locErr}</p>}

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {['', ...REST_ROUTES].map((r) => (
          <button
            key={r || 'all'}
            type="button"
            onClick={() => setRoute(r)}
            className={`min-h-10 shrink-0 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap ${
              route === r
                ? 'border-rest bg-rest text-white'
                : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'
            }`}
          >
            {r || '전체 노선'}
          </button>
        ))}
      </div>

      <p className="mt-3 mb-2 text-sm font-semibold text-stone-500">
        {nearMode ? '가까운 순' : `${list.length}곳`}
      </p>

      <ul className="space-y-2">
        {list.map((r) => {
          const d = pos && r.lat ? distanceKm(pos.lat, pos.lng, r.lat, r.lng) : null;
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onPick(r)}
                className="flex min-h-15 w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-left active:bg-green-50 dark:border-stone-700 dark:bg-stone-800 dark:active:bg-stone-700"
              >
                <Signpost className="size-5 shrink-0 text-rest" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-bold">
                    {r.name}
                    {r.dir && <span className="ml-1 font-semibold text-stone-500">({r.dir}방향)</span>}
                  </span>
                  <span className="block truncate text-[13px] text-stone-500">
                    {r.route} · {r.sido} {r.sigungu}
                  </span>
                </span>
                {visitedIds.has(r.id) && (
                  <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800 dark:bg-green-900/50 dark:text-green-200">
                    기록 있음
                  </span>
                )}
                {d != null && nearMode && <span className="shrink-0 text-sm font-bold text-stone-500">{d.toFixed(0)}km</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => onCustom(q.trim())}
        className="mt-4 mb-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-400 text-[15px] font-semibold text-stone-600 dark:text-stone-300"
      >
        <PencilLine className="size-4" />
        {q.trim() ? `'${q.trim()}' 직접 입력하기` : '목록에 없으면 직접 입력'}
      </button>
    </Sheet>
  );
}

