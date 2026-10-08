// 기록 입력/수정 폼 — 현장에서 10초 기록을 목표로: 필수는 상호명뿐, 나머지는 원터치
import { useEffect, useRef, useState } from 'react';
import {
  BedDouble,
  ChevronDown,
  Coffee,
  History,
  Link2,
  MapPin,
  Plus,
  Search,
  Signpost,
  User,
  UtensilsCrossed,
  WandSparkles,
  X,
} from 'lucide-react';
import type { Category, Dish, Place, RegionFilter } from '../types';
import {
  FOOD_PRICE_PRESETS,
  FOOD_TAGS,
  REST_FOOD_PRESETS,
  REST_TAGS,
  REVISIT_LABEL,
  STAY_PRICE_PRESETS,
  STAY_PRICE_TYPE_LABEL,
  STAY_TAGS,
} from '../data/tags';
import { detectRegion, regionLabel } from '../data/regions';
import { parsePrice, shortWon, todayStr, uid } from '../lib/format';
import { kakaoMapUrl, naverMapUrl } from '../lib/maps';
import { RegionPicker } from './RegionPicker';
import { RestPicker } from './RestPicker';
import { restLabel } from '../data/restAreas';
import { Chip, Field, Sheet, StarInput, Toggle, inputCls } from './ui';

const blank = (category: Category, region: RegionFilter): Place => ({
  id: uid(),
  category,
  name: '',
  sido: region.sido,
  sigungu: region.sigungu,
  address: '',
  mapUrl: '',
  rating: 0,
  revisit: 'soso',
  memo: '',
  tags: [],
  visitedAt: todayStr(),
  menu: '',
  pricePerPerson: null,
  solo: false,
  breakfast: false,
  stayPrice: null,
  stayPriceType: 'paid',
  roomType: '',
  restId: '',
  route: '',
  dishes: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export function PlaceForm({
  open,
  initial,
  places,
  defaultCategory,
  defaultRegion,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Place | null; // null = 새 기록
  places: Place[];
  defaultCategory: Category;
  defaultRegion: RegionFilter;
  onClose: () => void;
  onSave: (p: Place) => void;
}) {
  const [f, setF] = useState<Place>(() => blank(defaultCategory, defaultRegion));
  const [priceText, setPriceText] = useState('');
  const [regionOpen, setRegionOpen] = useState(false);
  const [error, setError] = useState('');
  const [autoHint, setAutoHint] = useState('');
  const [restOpen, setRestOpen] = useState(false);
  const [customRest, setCustomRest] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const base = initial ? { ...initial } : blank(defaultCategory, defaultRegion);
    setF(base);
    const price = base.category === 'food' ? base.pricePerPerson : base.stayPrice;
    setPriceText(price ? price.toLocaleString('ko-KR') : '');
    setError('');
    setAutoHint('');
    setCustomRest(!!initial && initial.category === 'rest' && !initial.restId);
    if (!initial) {
      // 휴게소는 바로 휴게소 선택 시트부터 (가장 빠른 동선)
      if (base.category === 'rest') setTimeout(() => setRestOpen(true), 200);
      else setTimeout(() => nameRef.current?.focus(), 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = <K extends keyof Place>(k: K, v: Place[K]) => setF((s) => ({ ...s, [k]: v }));
  const isFood = f.category === 'food';
  const isRest = f.category === 'rest';

  const switchCategory = (c: Category) => {
    if (c === f.category) return;
    const leavingRest = f.category === 'rest' && !!f.restId;
    setF((s) => ({ ...s, category: c, tags: [], ...(leavingRest ? { name: '', restId: '', route: '' } : {}) }));
    setPriceText('');
    setError('');
    if (c === 'rest' && !f.restId) setRestOpen(true);
  };

  // ---- 휴게소: 먹은 메뉴 ----
  const addDish = (name = '') => setF((s) => ({ ...s, dishes: [...s.dishes, { name, price: null }] }));
  const updateDish = (i: number, patch: Partial<Dish>) =>
    setF((s) => ({ ...s, dishes: s.dishes.map((d, j) => (j === i ? { ...d, ...patch } : d)) }));
  const toggleDish = (d: Dish) =>
    setF((s) =>
      s.dishes.some((x) => x.name === d.name)
        ? { ...s, dishes: s.dishes.filter((x) => x.name !== d.name) }
        : { ...s, dishes: [...s.dishes, { ...d }] },
    );
  const removeDish = (i: number) => setF((s) => ({ ...s, dishes: s.dishes.filter((_, j) => j !== i) }));
  const dishTotal = f.dishes.reduce((a, d) => a + (d.price ?? 0), 0);

  // 같은 휴게소에서 예전에 먹은 메뉴 (원터치 재입력)
  const prevDishes = (() => {
    if (!isRest || !f.restId) return [] as Dish[];
    const seen = new Map<string, Dish>();
    for (const p of places) {
      if (p.restId !== f.restId || p.id === f.id) continue;
      for (const d of p.dishes) if (d.name && !seen.has(d.name)) seen.set(d.name, d);
    }
    return [...seen.values()].slice(0, 10);
  })();

  const visitedRestIds = new Set(places.filter((p) => p.restId).map((p) => p.restId));

  const setPrice = (n: number | null) => {
    setPriceText(n ? n.toLocaleString('ko-KR') : '');
    if (isFood) set('pricePerPerson', n);
    else set('stayPrice', n);
  };

  const toggleTag = (t: string) =>
    set('tags', f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t]);

  const autoRegionFromAddress = () => {
    const r = detectRegion(f.address);
    if (r && (r.sido !== f.sido || r.sigungu !== f.sigungu)) {
      setF((s) => ({ ...s, sido: r.sido, sigungu: r.sigungu || s.sigungu }));
      setAutoHint(`주소에서 '${regionLabel(r.sido, r.sigungu)}' 자동 인식`);
    }
  };

  const searchQuery = [f.sigungu || f.sido, f.name].filter(Boolean).join(' ');

  const submit = () => {
    if (!f.name.trim()) {
      if (isRest) {
        setError('휴게소를 선택해 주세요');
        setRestOpen(true);
      } else {
        setError('상호명을 입력해 주세요');
        nameRef.current?.focus();
      }
      return;
    }
    const price = parsePrice(priceText);
    onSave({
      ...f,
      name: f.name.trim(),
      pricePerPerson: f.category === 'food' ? price : f.pricePerPerson,
      stayPrice: f.category === 'stay' ? price : f.stayPrice,
      dishes: f.dishes.map((d) => ({ ...d, name: d.name.trim() })).filter((d) => d.name),
      updatedAt: Date.now(),
    });
  };

  const tone = isFood ? 'food' : isRest ? 'rest' : 'stay';
  const presets = isFood ? FOOD_PRICE_PRESETS : STAY_PRICE_PRESETS;

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        full
        title={initial ? '기록 수정' : '새 기록'}
        footer={
          <button
            onClick={submit}
            className="min-h-14 w-full rounded-2xl bg-brand-700 text-lg font-bold text-white shadow-lg shadow-brand-700/25 active:bg-brand-800"
          >
            {initial ? '수정 저장' : '저장하기'}
          </button>
        }
      >
        {/* 카테고리 */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          {(
            [
              ['food', '식당/카페', UtensilsCrossed, 'border-food bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200'],
              ['stay', '숙박', BedDouble, 'border-stay bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200'],
              ['rest', '휴게소', Signpost, 'border-rest bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200'],
            ] as const
          ).map(([c, label, Icon, on]) => (
            <button
              key={c}
              type="button"
              onClick={() => switchCategory(c)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-[16px] font-bold active:scale-[0.98] ${
                f.category === c ? on : 'border-stone-200 text-stone-500 dark:border-stone-700'
              }`}
            >
              <Icon className="size-5" /> {label}
            </button>
          ))}
        </div>

        {isRest ? (
          <Field label={<>휴게소 <span className="text-rose-500">*</span></>}>
            <button
              type="button"
              onClick={() => setRestOpen(true)}
              className={`${inputCls} flex min-h-16 items-center gap-3 text-left ${error ? 'border-rose-500' : ''}`}
            >
              <Signpost className="size-6 shrink-0 text-rest" />
              <span className="min-w-0 flex-1">
                {f.name ? (
                  <>
                    <span className="block truncate text-lg font-bold">{f.name}</span>
                    <span className="block truncate text-[13px] text-stone-500">
                      {[f.route, regionLabel(f.sido, f.sigungu)].filter(Boolean).join(' · ')}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-stone-400">휴게소 선택 (검색·가까운 곳)</span>
                )}
              </span>
              <ChevronDown className="size-5 text-stone-400" />
            </button>
            {customRest && !f.restId && (
              <input
                ref={nameRef}
                value={f.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  if (error) setError('');
                }}
                placeholder="휴게소 이름 직접 입력 (예: 행담도휴게소)"
                className={`${inputCls} mt-2 font-semibold`}
              />
            )}
            {error && <p className="mt-1.5 text-sm font-semibold text-rose-600">{error}</p>}
          </Field>
        ) : (
        <Field label={<>상호명 <span className="text-rose-500">*</span></>}>
          <input
            ref={nameRef}
            value={f.name}
            onChange={(e) => {
              set('name', e.target.value);
              if (error) setError('');
            }}
            placeholder={isFood ? '예) 할매국밥' : '예) OO모텔 해운대점'}
            className={`${inputCls} min-h-14 text-lg font-semibold ${error ? 'border-rose-500' : ''}`}
            enterKeyHint="done"
          />
          {error && <p className="mt-1.5 text-sm font-semibold text-rose-600">{error}</p>}
        </Field>
        )}

        {(!isRest || !f.restId) && (
        <Field label="지역" hint={autoHint}>
          <button
            type="button"
            onClick={() => setRegionOpen(true)}
            className={`${inputCls} flex items-center justify-between text-left font-semibold`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="size-5 text-brand-600" />
              {f.sido ? regionLabel(f.sido, f.sigungu) : <span className="text-stone-400">시·도 / 시·군·구 선택</span>}
            </span>
            <ChevronDown className="size-5 text-stone-400" />
          </button>
        </Field>
        )}

        <Field label="별점">
          <StarInput value={f.rating} onChange={(v) => set('rating', v)} />
        </Field>

        <Field label="재방문 의사">
          <div className="grid grid-cols-3 gap-2">
            {(['yes', 'soso', 'no'] as const).map((v) => {
              const active = f.revisit === v;
              const color =
                v === 'yes'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : v === 'no'
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-stone-600 bg-stone-600 text-white';
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('revisit', v)}
                  className={`min-h-13 rounded-2xl border text-[16px] font-bold active:scale-95 ${
                    active ? color : 'border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-800'
                  }`}
                >
                  {v === 'yes' ? '👍 ' : v === 'no' ? '👎 ' : ''}
                  {REVISIT_LABEL[v]}
                </button>
              );
            })}
          </div>
        </Field>

        {isRest ? (
          <Field label="뭘 먹었나요?" hint={dishTotal ? `합계 ${dishTotal.toLocaleString('ko-KR')}원` : '탭하면 추가'}>
            <div className="flex flex-wrap gap-2">
              {REST_FOOD_PRESETS.map((n) => (
                <Chip key={n} active={f.dishes.some((d) => d.name === n)} onClick={() => toggleDish({ name: n, price: null })} tone="rest">
                  {n}
                </Chip>
              ))}
            </div>
            {prevDishes.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-stone-500">
                  <History className="size-3.5" /> 여기서 전에 먹은 메뉴
                </p>
                <div className="flex flex-wrap gap-2">
                  {prevDishes.map((d) => (
                    <Chip
                      key={d.name}
                      active={f.dishes.some((x) => x.name === d.name)}
                      onClick={() => toggleDish(d)}
                      tone="rest"
                    >
                      {d.name}
                      {d.price ? ` ${shortWon(d.price)}` : ''}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            {f.dishes.length > 0 && (
              <ul className="mt-3 space-y-2">
                {f.dishes.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input
                      value={d.name}
                      onChange={(e) => updateDish(i, { name: e.target.value })}
                      placeholder="메뉴"
                      className={`${inputCls} min-w-0 flex-1 font-semibold`}
                    />
                    <div className="relative w-28 shrink-0">
                      <input
                        defaultValue={d.price ? d.price.toLocaleString('ko-KR') : ''}
                        key={`${i}-${d.name}`}
                        onBlur={(e) => {
                          const n = parsePrice(e.target.value);
                          e.target.value = n ? n.toLocaleString('ko-KR') : '';
                          updateDish(i, { price: n });
                        }}
                        inputMode="numeric"
                        placeholder="가격"
                        className={`${inputCls} pr-8 text-right`}
                      />
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-stone-400">원</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDish(i)}
                      aria-label="메뉴 삭제"
                      className="-ml-1 grid size-10 shrink-0 place-items-center rounded-xl text-stone-400 active:bg-stone-100 dark:active:bg-stone-800"
                    >
                      <X className="size-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => addDish()}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-400 text-[15px] font-semibold text-stone-600 dark:text-stone-300"
            >
              <Plus className="size-4" /> 메뉴 직접 추가
            </button>
          </Field>
        ) : isFood ? (
          <>
            <Field label="대표 메뉴">
              <input
                value={f.menu}
                onChange={(e) => set('menu', e.target.value)}
                placeholder="예) 돼지국밥, 백반"
                className={inputCls}
              />
            </Field>
            <Field label="1인당 가격">
              <PriceInput value={priceText} onChange={setPriceText} onPreset={setPrice} presets={presets} tone={tone} />
            </Field>
            <Field label="식사 유형">
              <div className="flex gap-2">
                <Toggle checked={f.solo} onChange={(v) => set('solo', v)} label="혼밥 가능" icon={<User className="size-5" />} />
                <Toggle
                  checked={f.breakfast}
                  onChange={(v) => set('breakfast', v)}
                  label="아침 가능"
                  icon={<Coffee className="size-5" />}
                />
              </div>
            </Field>
          </>
        ) : (
          <>
            <Field label="1박 비용">
              <div className="mb-2 grid grid-cols-3 gap-2">
                {(['paid', 'off', 'peak'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('stayPriceType', t)}
                    className={`min-h-11 rounded-xl border text-[15px] font-semibold ${
                      f.stayPriceType === t
                        ? 'border-stay bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200'
                        : 'border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    {STAY_PRICE_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
              <PriceInput value={priceText} onChange={setPriceText} onPreset={setPrice} presets={presets} tone={tone} />
            </Field>
            <Field label="룸 타입">
              <input
                value={f.roomType}
                onChange={(e) => set('roomType', e.target.value)}
                placeholder="예) 스탠다드 더블, 트윈, 온돌"
                className={inputCls}
              />
            </Field>
          </>
        )}

        <Field label={isFood ? '특징 태그' : isRest ? '휴게소 편의시설' : '시설·컨디션 태그'} hint="원터치 선택">
          <div className="flex flex-wrap gap-2">
            {(isFood ? FOOD_TAGS : isRest ? REST_TAGS : STAY_TAGS).map((t) => (
              <Chip key={t} active={f.tags.includes(t)} onClick={() => toggleTag(t)} tone={tone}>
                {t}
              </Chip>
            ))}
          </div>
        </Field>

        {!isRest && (
        <Field label="위치/주소" hint="주소 입력 시 지역 자동 인식">
          <div className="flex gap-2">
            <input
              value={f.address}
              onChange={(e) => set('address', e.target.value)}
              onBlur={autoRegionFromAddress}
              placeholder="예) 부산 해운대구 우동 123"
              className={inputCls}
            />
            <button
              type="button"
              onClick={autoRegionFromAddress}
              aria-label="주소로 지역 인식"
              className="grid min-h-12 w-12 shrink-0 place-items-center rounded-2xl border border-stone-300 text-brand-700 dark:border-stone-700 dark:text-brand-500"
            >
              <WandSparkles className="size-5" />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href={kakaoMapUrl(searchQuery)}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!searchQuery}
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] text-[15px] font-bold text-stone-900 aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              <Search className="size-4" /> 카카오맵 검색
            </a>
            <a
              href={naverMapUrl(searchQuery)}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!searchQuery}
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#03C75A] text-[15px] font-bold text-white aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              <Search className="size-4" /> 네이버 검색
            </a>
          </div>
          <div className="relative mt-2">
            <Link2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-400" />
            <input
              value={f.mapUrl}
              onChange={(e) => set('mapUrl', e.target.value.trim())}
              placeholder="지도 앱 '공유 → 링크 복사' 붙여넣기 (선택)"
              inputMode="url"
              className={`${inputCls} pl-10 text-[15px]`}
            />
          </div>
        </Field>
        )}

        <Field label="메모" hint={isRest ? '한줄평, 줄 서는 곳 등' : '주차, 한줄평 등'}>
          <textarea
            value={f.memo}
            onChange={(e) => set('memo', e.target.value)}
            rows={3}
            placeholder="예) 공영주차장 도보 2분, 김치찌개 진짜 맛있음"
            className={`${inputCls} py-3 leading-relaxed`}
          />
        </Field>

        <Field label="방문일">
          <input type="date" value={f.visitedAt} onChange={(e) => set('visitedAt', e.target.value)} className={inputCls} />
        </Field>
      </Sheet>

      <RestPicker
        open={restOpen}
        onClose={() => setRestOpen(false)}
        visitedIds={visitedRestIds}
        onPick={(r) => {
          setF((s) => ({
            ...s,
            name: restLabel(r.name, r.dir),
            restId: r.id,
            route: r.route,
            sido: r.sido,
            sigungu: r.sigungu,
          }));
          setError('');
          setRestOpen(false);
        }}
        onCustom={(name) => {
          const n = name && !/휴게소|쉼터/.test(name) ? `${name}휴게소` : name;
          setF((s) => ({ ...s, name: n, restId: '', route: '' }));
          setError('');
          setRestOpen(false);
          setCustomRest(true);
          setTimeout(() => nameRef.current?.focus(), 250);
        }}
      />

      <RegionPicker
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        value={{ sido: f.sido, sigungu: f.sigungu }}
        onSelect={(r) => {
          setF((s) => ({ ...s, sido: r.sido, sigungu: r.sigungu }));
          setAutoHint('');
        }}
      />
    </>
  );
}

function PriceInput({
  value,
  onChange,
  onPreset,
  presets,
  tone,
}: {
  value: string;
  onChange: (v: string) => void;
  onPreset: (n: number) => void;
  presets: number[];
  tone: 'food' | 'stay' | 'rest';
}) {
  const n = parsePrice(value);
  return (
    <>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            const p = parsePrice(value);
            onChange(p ? p.toLocaleString('ko-KR') : '');
          }}
          inputMode="numeric"
          placeholder="직접 입력 (예: 12000, 1만2천)"
          className={`${inputCls} pr-10 text-lg font-semibold`}
        />
        <span className="absolute top-1/2 right-4 -translate-y-1/2 font-semibold text-stone-400">원</span>
      </div>
      <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
        {presets.map((p) => (
          <Chip key={p} active={n === p} onClick={() => onPreset(p)} tone={tone}>
            {shortWon(p)}
          </Chip>
        ))}
      </div>
    </>
  );
}
