// 지역 선택 바텀시트: 시·도 → 시/군/구 2단계, 큼직한 버튼
import { useEffect, useState } from 'react';
import { ChevronLeft, MapPin } from 'lucide-react';
import { SIDO_LIST, findSido } from '../data/regions';
import { Sheet } from './ui';
import type { RegionFilter } from '../types';

export function RegionPicker({
  open,
  onClose,
  value,
  onSelect,
  allowNationwide,
  counts,
}: {
  open: boolean;
  onClose: () => void;
  value: RegionFilter;
  onSelect: (v: RegionFilter) => void;
  allowNationwide?: boolean; // 필터용: '전국' 선택 허용
  counts?: Record<string, number>; // "부산" / "부산 해운대구" 별 기록 수
}) {
  const [sido, setSido] = useState(value.sido);
  useEffect(() => {
    if (open) setSido(value.sido);
  }, [open, value.sido]);

  const current = findSido(sido);
  const count = (k: string) => counts?.[k] ?? 0;

  const pick = (v: RegionFilter) => {
    onSelect(v);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      full
      title={
        current ? (
          <button onClick={() => setSido('')} className="-ml-1 flex items-center gap-1">
            <ChevronLeft className="size-6" /> {current.full}
          </button>
        ) : (
          '지역 선택'
        )
      }
    >
      {!current ? (
        <>
          {allowNationwide && (
            <button
              onClick={() => pick({ sido: '', sigungu: '' })}
              className={`mb-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border text-lg font-bold active:scale-[0.98] ${
                !value.sido
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-800'
              }`}
            >
              <MapPin className="size-5" /> 전국 전체
            </button>
          )}
          <div className="grid grid-cols-3 gap-2">
            {SIDO_LIST.map((s) => (
              <button
                key={s.name}
                onClick={() => setSido(s.name)}
                className={`relative min-h-16 rounded-2xl border text-lg font-bold active:scale-95 ${
                  value.sido === s.name
                    ? 'border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-800/30 dark:text-brand-100'
                    : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800'
                }`}
              >
                {s.name}
                {count(s.name) > 0 && (
                  <span className="absolute top-1.5 right-2 text-xs font-semibold text-brand-600">{count(s.name)}</span>
                )}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {allowNationwide && (
            <button
              onClick={() => pick({ sido: current.name, sigungu: '' })}
              className="mb-3 min-h-14 w-full rounded-2xl border border-brand-600 bg-brand-50 text-lg font-bold text-brand-800 active:scale-[0.98] dark:bg-brand-800/30 dark:text-brand-100"
            >
              {current.name} 전체 {count(current.name) > 0 && `(${count(current.name)})`}
            </button>
          )}
          <div className="grid grid-cols-3 gap-2">
            {current.sigungu.map((g) => {
              const n = count(`${current.name} ${g}`);
              const active = value.sido === current.name && value.sigungu === g;
              return (
                <button
                  key={g}
                  onClick={() => pick({ sido: current.name, sigungu: g })}
                  className={`relative min-h-14 rounded-2xl border px-1 text-[16px] font-semibold active:scale-95 ${
                    active
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : n > 0
                        ? 'border-brand-500/60 bg-white dark:bg-stone-800'
                        : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800'
                  }`}
                >
                  {g}
                  {n > 0 && (
                    <span className={`absolute top-1 right-1.5 text-[11px] font-bold ${active ? 'text-white' : 'text-brand-600'}`}>
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </Sheet>
  );
}
