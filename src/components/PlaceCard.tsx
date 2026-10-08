import { BedDouble, Coffee, Navigation, Signpost, ThumbsDown, ThumbsUp, User, UtensilsCrossed } from 'lucide-react';
import type { Place } from '../types';
import { STAY_PRICE_TYPE_LABEL } from '../data/tags';
import { won } from '../lib/format';
import { kakaoMapUrl, mapQuery, naverMapUrl } from '../lib/maps';
import { Stars } from './ui';

export function RevisitBadge({ v }: { v: Place['revisit'] }) {
  if (v === 'yes')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
        <ThumbsUp className="size-3.5" /> 강추
      </span>
    );
  if (v === 'no')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-900/50 dark:text-rose-200">
        <ThumbsDown className="size-3.5" /> 비추
      </span>
    );
  return null;
}

/** 카드에 보여줄 핵심 태그 */
export function keyTags(p: Place) {
  const t: string[] = [];
  if (p.category === 'food') {
    if (p.solo) t.push('혼밥 가능');
    if (p.breakfast) t.push('아침 가능');
  }
  return [...t, ...p.tags];
}

export const CATEGORY_STYLE = {
  food: { label: '식당/카페', icon: 'bg-orange-100 text-food dark:bg-orange-950/60', tag: 'bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200', badge: 'bg-food' },
  stay: { label: '숙박', icon: 'bg-indigo-100 text-stay dark:bg-indigo-950/60 dark:text-indigo-300', tag: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200', badge: 'bg-stay' },
  rest: { label: '휴게소', icon: 'bg-green-100 text-rest dark:bg-green-950/60 dark:text-green-300', tag: 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200', badge: 'bg-rest' },
} as const;

export const CategoryIcon = ({ c, className }: { c: Place['category']; className?: string }) =>
  c === 'food' ? <UtensilsCrossed className={className} /> : c === 'stay' ? <BedDouble className={className} /> : <Signpost className={className} />;

export function priceLine(p: Place) {
  if (p.category === 'rest') {
    const names = p.dishes.map((d) => d.name).join(' · ');
    const total = p.dishes.reduce((a, d) => a + (d.price ?? 0), 0);
    return [names, total ? `${won(total)}` : ''].filter(Boolean).join(' · ');
  }
  if (p.category === 'food') {
    const price = p.pricePerPerson ? `1인 ${won(p.pricePerPerson)}` : '';
    return [p.menu, price].filter(Boolean).join(' · ');
  }
  const price = p.stayPrice ? `1박 ${won(p.stayPrice)} (${STAY_PRICE_TYPE_LABEL[p.stayPriceType]})` : '';
  return [price, p.roomType].filter(Boolean).join(' · ');
}

export function PlaceCard({ p, onOpen }: { p: Place; onOpen: () => void }) {
  const st = CATEGORY_STYLE[p.category];
  const tags = keyTags(p);
  const q = mapQuery(p);
  const line = priceLine(p);

  return (
    <article
      className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800 ${
        p.revisit === 'no' ? 'opacity-75' : ''
      }`}
    >
      <button onClick={onOpen} className="block w-full px-4 pt-4 pb-3 text-left active:bg-stone-50 dark:active:bg-stone-800/60">
        <div className="flex items-start gap-3">
          <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${st.icon}`}>
            <CategoryIcon c={p.category} className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[17px] leading-tight font-bold">{p.name}</h3>
              <RevisitBadge v={p.revisit} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              <Stars value={p.rating} />
              {p.category === 'rest' && p.route ? (
                <span className="truncate">· {p.route}</span>
              ) : (
                p.sigungu && <span className="truncate">· {p.sigungu}</span>
              )}
            </div>
            {line && <p className="mt-1.5 text-[15px] font-semibold text-stone-800 dark:text-stone-100">{line}</p>}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map((t) => (
              <span
                key={t}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-medium ${st.tag}`}
              >
                {t === '혼밥 가능' && <User className="size-3.5" />}
                {t === '아침 가능' && <Coffee className="size-3.5" />}
                {t}
              </span>
            ))}
            {tags.length > 5 && <span className="px-1 py-1 text-[13px] text-stone-400">+{tags.length - 5}</span>}
          </div>
        )}

        {p.memo && <p className="mt-2.5 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">“{p.memo}”</p>}
      </button>

      <div className="grid grid-cols-2 border-t border-stone-100 dark:border-stone-800">
        <a
          href={kakaoMapUrl(q)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-1.5 text-[15px] font-bold text-stone-700 active:bg-yellow-50 dark:text-stone-200 dark:active:bg-stone-800"
        >
          <Navigation className="size-4 text-yellow-500" /> 카카오맵
        </a>
        <a
          href={naverMapUrl(q)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-1.5 border-l border-stone-100 text-[15px] font-bold text-stone-700 active:bg-green-50 dark:border-stone-800 dark:text-stone-200 dark:active:bg-stone-800"
        >
          <Navigation className="size-4 text-green-500" /> 네이버지도
        </a>
      </div>
    </article>
  );
}
