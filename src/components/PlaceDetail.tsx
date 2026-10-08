import { useEffect, useState } from 'react';
import { Calendar, Copy, ExternalLink, MapPin, Navigation, Pencil, Trash2 } from 'lucide-react';
import type { Place } from '../types';
import { REVISIT_LABEL } from '../data/tags';
import { won } from '../lib/format';
import { regionLabel } from '../data/regions';
import { kakaoMapUrl, mapQuery, naverMapUrl } from '../lib/maps';
import { CATEGORY_STYLE, keyTags, priceLine } from './PlaceCard';
import { Sheet, Stars } from './ui';

export function PlaceDetail({
  place,
  onClose,
  onEdit,
  onDelete,
  toast,
}: {
  place: Place | null;
  onClose: () => void;
  onEdit: (p: Place) => void;
  onDelete: (p: Place) => void;
  toast: (m: string) => void;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => setArmed(false), [place?.id]);
  if (!place) return null;
  const p = place;
  const q = mapQuery(p);
  const tags = keyTags(p);
  const line = priceLine(p);

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(p.address || q);
      toast('주소를 복사했어요');
    } catch {
      toast('복사할 수 없어요');
    }
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={<span className="truncate">{p.name}</span>}
      footer={
        <div className="flex gap-2">
          <button
            onClick={() => (armed ? onDelete(p) : setArmed(true))}
            className={`flex min-h-14 shrink-0 items-center justify-center gap-1 rounded-2xl border font-bold transition-all ${
              armed
                ? 'w-28 border-rose-600 bg-rose-600 text-white'
                : 'w-16 border-rose-200 text-rose-600 active:bg-rose-50 dark:border-rose-900 dark:active:bg-rose-950'
            }`}
            aria-label={armed ? '한 번 더 누르면 삭제' : '삭제'}
          >
            <Trash2 className="size-5" />
            {armed && '삭제'}
          </button>
          <button
            onClick={() => onEdit(p)}
            className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-700 text-lg font-bold text-white active:bg-brand-800"
          >
            <Pencil className="size-5" /> 수정하기
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${CATEGORY_STYLE[p.category].badge}`}>
              {CATEGORY_STYLE[p.category].label}
            </span>
            {p.route && <span className="font-semibold">{p.route}</span>}
            <MapPin className="size-4" /> {regionLabel(p.sido, p.sigungu)}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Stars value={p.rating} size="lg" />
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                p.revisit === 'yes'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                  : p.revisit === 'no'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200'
                    : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
              }`}
            >
              재방문 {REVISIT_LABEL[p.revisit]}
            </span>
          </div>
          {p.category !== 'rest' && line && <p className="mt-3 text-lg font-bold">{line}</p>}
        </div>

        {p.category === 'rest' && p.dishes.length > 0 && (
          <div className="rounded-2xl bg-green-50 p-4 dark:bg-green-950/30">
            <p className="mb-2 text-sm font-bold text-green-800 dark:text-green-200">먹은 메뉴</p>
            <ul className="space-y-1.5">
              {p.dishes.map((d, i) => (
                <li key={i} className="flex justify-between text-[16px]">
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-stone-600 dark:text-stone-300">{d.price ? won(d.price) : '-'}</span>
                </li>
              ))}
            </ul>
            {p.dishes.some((d) => d.price) && (
              <div className="mt-2 flex justify-between border-t border-green-200 pt-2 text-[16px] font-bold dark:border-green-900">
                <span>합계</span>
                <span>{won(p.dishes.reduce((a, d) => a + (d.price ?? 0), 0))}</span>
              </div>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-xl bg-stone-100 px-3 py-1.5 text-[15px] font-medium dark:bg-stone-800">
                {t}
              </span>
            ))}
          </div>
        )}

        {p.memo && (
          <p className="rounded-2xl bg-amber-50 p-4 text-[16px] leading-relaxed whitespace-pre-wrap text-stone-800 dark:bg-amber-950/30 dark:text-amber-50">
            {p.memo}
          </p>
        )}

        <div className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-5 shrink-0 text-stone-400" />
            <p className="flex-1 text-[15px]">
              {p.address || (p.category === 'rest' ? p.name : <span className="text-stone-400">주소 미입력</span>)}
            </p>
            <button onClick={copyAddr} aria-label="주소 복사" className="-m-2 grid size-10 place-items-center text-stone-500">
              <Copy className="size-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={kakaoMapUrl(q)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] font-bold text-stone-900 active:brightness-95"
            >
              <Navigation className="size-4" /> 카카오맵 길찾기
            </a>
            <a
              href={naverMapUrl(q)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-[#03C75A] font-bold text-white active:brightness-95"
            >
              <Navigation className="size-4" /> 네이버 길찾기
            </a>
          </div>
          {p.mapUrl && (
            <a
              href={p.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-stone-300 text-[15px] font-semibold dark:border-stone-700"
            >
              <ExternalLink className="size-4" /> 저장한 지도 링크 열기
            </a>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-sm text-stone-400">
          <Calendar className="size-4" /> 방문일 {p.visitedAt}
        </p>
      </div>
    </Sheet>
  );
}
