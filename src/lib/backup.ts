import type { Place } from '../types';
import { todayStr } from './format';

const APP_ID = 'eodiseo-meokgo-jaji';
const VERSION = 1;

export function exportJSON(places: Place[]) {
  const payload = { app: APP_ID, version: VERSION, exportedAt: new Date().toISOString(), count: places.length, places };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `어디서먹고자지_백업_${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  try {
    localStorage.setItem('cn.lastBackup', String(Date.now()));
  } catch {
    /* ignore */
  }
}

/** 백업 파일을 읽어 Place 배열로 정규화 (구버전/누락 필드 보정) */
export async function readBackupFile(file: File): Promise<Place[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  const raw: unknown[] = Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : [];
  // app 이름이 달라도(구버전 '출장노트' 백업 포함) places 배열만 있으면 가져옵니다.
  if (!raw.length) throw new Error('백업 파일에 기록이 없습니다.');
  return raw.filter((r): r is Partial<Place> => !!r && typeof r === 'object' && 'name' in r).map(normalize);
}

export function normalize(p: Partial<Place>): Place {
  const now = Date.now();
  return {
    id: p.id || `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    category: p.category === 'stay' || p.category === 'rest' ? p.category : 'food',
    name: String(p.name ?? '').trim(),
    sido: p.sido ?? '',
    sigungu: p.sigungu ?? '',
    address: p.address ?? '',
    mapUrl: p.mapUrl ?? '',
    rating: Math.max(0, Math.min(5, Number(p.rating) || 0)),
    revisit: p.revisit === 'yes' || p.revisit === 'no' ? p.revisit : 'soso',
    memo: p.memo ?? '',
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    visitedAt: p.visitedAt ?? todayStr(),
    menu: p.menu ?? '',
    pricePerPerson: typeof p.pricePerPerson === 'number' ? p.pricePerPerson : null,
    solo: !!p.solo,
    breakfast: !!p.breakfast,
    stayPrice: typeof p.stayPrice === 'number' ? p.stayPrice : null,
    stayPriceType: p.stayPriceType === 'off' || p.stayPriceType === 'peak' ? p.stayPriceType : 'paid',
    roomType: p.roomType ?? '',
    restId: p.restId ?? '',
    route: p.route ?? '',
    dishes: Array.isArray(p.dishes)
      ? p.dishes
          .filter((d) => d && typeof d.name === 'string')
          .map((d) => ({ name: d.name, price: typeof d.price === 'number' ? d.price : null }))
      : [],
    createdAt: p.createdAt ?? now,
    updatedAt: p.updatedAt ?? now,
  };
}

/** 병합: 같은 id 는 더 최근에 수정된 쪽을 유지 */
export function mergePlaces(current: Place[], incoming: Place[]) {
  const map = new Map(current.map((p) => [p.id, p]));
  let added = 0;
  let updated = 0;
  for (const p of incoming) {
    const cur = map.get(p.id);
    if (!cur) {
      map.set(p.id, p);
      added++;
    } else if (p.updatedAt > cur.updatedAt) {
      map.set(p.id, p);
      updated++;
    }
  }
  return { list: [...map.values()], added, updated };
}

export const lastBackupAt = (): number | null => {
  try {
    const v = localStorage.getItem('cn.lastBackup');
    return v ? Number(v) : null;
  } catch {
    return null;
  }
};
