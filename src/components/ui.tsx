// 공용 작은 UI 조각들: 바텀시트, 칩, 토글, 별점
import { useEffect, type ReactNode } from 'react';
import { Star, X } from 'lucide-react';

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  full,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  full?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="animate-fade-in absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`animate-sheet-up relative mx-auto flex w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-stone-900 ${
          full ? 'sheet-full' : 'sheet-max'
        }`}
      >
        <div className="flex items-center gap-2 border-b border-stone-200 py-2 pr-3 pl-4 dark:border-stone-800">
          <div className="min-w-0 flex-1 text-lg font-bold">{title}</div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="-mr-2 grid size-11 place-items-center rounded-full text-stone-500 active:bg-stone-100 dark:active:bg-stone-800"
          >
            <X className="size-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-6">{children}</div>
        {footer && (
          <div className="pb-safe border-t border-stone-200 bg-white px-4 pt-3 dark:border-stone-800 dark:bg-stone-900">
            <div className="pb-3">{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
  tone = 'brand',
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: 'brand' | 'food' | 'cafe' | 'stay' | 'rest';
}) {
  const on = {
    brand: 'border-brand-600 bg-brand-600 text-white',
    food: 'border-food bg-food text-white',
    stay: 'border-stay bg-stay text-white',
    rest: 'border-rest bg-rest text-white',
    cafe: 'border-cafe bg-cafe text-white',
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 shrink-0 rounded-full border px-4 text-[15px] font-medium whitespace-nowrap transition active:scale-95 ${
        active
          ? on
          : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'
      }`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-14 flex-1 items-center justify-between gap-2 rounded-2xl border px-4 text-[15px] font-semibold transition active:scale-[0.98] ${
        checked
          ? 'border-food bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200'
          : 'border-stone-300 bg-white text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-food' : 'bg-stone-300 dark:bg-stone-600'}`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}

export function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'size-5' : 'size-4';
  if (!value) return <span className="text-xs text-stone-400">별점 없음</span>;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'}`}
        />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i}점`}
          onClick={() => onChange(value === i ? 0 : i)}
          className="grid size-12 place-items-center rounded-xl active:scale-90"
        >
          <Star
            className={`size-9 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'}`}
          />
        </button>
      ))}
      <span className="ml-2 text-lg font-bold text-stone-500">{value ? `${value}.0` : '-'}</span>
    </div>
  );
}

export function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-bold text-stone-600 dark:text-stone-300">{label}</span>
        {hint && <span className="text-xs text-stone-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export const inputCls =
  'w-full min-h-12 rounded-2xl border border-stone-300 bg-white px-4 text-[16px] outline-none placeholder:text-stone-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-stone-700 dark:bg-stone-800';
