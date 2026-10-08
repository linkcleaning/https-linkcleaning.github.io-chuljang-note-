// 로컬 영구 저장소: IndexedDB 우선, 실패 시 localStorage 로 자동 대체
import type { Place } from '../types';

const DB_NAME = 'eodiseo-meokgo-jaji';
const STORE = 'places';
const LS_KEY = 'cn.places.fallback';

let dbPromise: Promise<IDBDatabase> | null = null;
let useFallback = false;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return openDB().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(req ? req.result : undefined);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

// ---- localStorage fallback ----
const lsRead = (): Place[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
};
const lsWrite = (list: Place[]) => localStorage.setItem(LS_KEY, JSON.stringify(list));

export async function getAllPlaces(): Promise<Place[]> {
  try {
    const list = (await tx<Place[]>('readonly', (s) => s.getAll())) ?? [];
    // 예전에 fallback 에 저장된 데이터가 있으면 IndexedDB 로 옮김
    const legacy = lsRead();
    if (legacy.length) {
      await putPlaces(legacy);
      localStorage.removeItem(LS_KEY);
      return [...list.filter((p) => !legacy.some((l) => l.id === p.id)), ...legacy];
    }
    return list;
  } catch {
    useFallback = true;
    return lsRead();
  }
}

export async function putPlace(p: Place): Promise<void> {
  return putPlaces([p]);
}

export async function putPlaces(list: Place[]): Promise<void> {
  if (useFallback) {
    const map = new Map(lsRead().map((p) => [p.id, p]));
    list.forEach((p) => map.set(p.id, p));
    lsWrite([...map.values()]);
    return;
  }
  await tx('readwrite', (s) => {
    list.forEach((p) => s.put(p));
  });
}

export async function deletePlace(id: string): Promise<void> {
  if (useFallback) {
    lsWrite(lsRead().filter((p) => p.id !== id));
    return;
  }
  await tx('readwrite', (s) => s.delete(id));
}

export async function clearPlaces(): Promise<void> {
  if (useFallback) {
    lsWrite([]);
    return;
  }
  await tx('readwrite', (s) => s.clear());
}

/** 브라우저가 저장공간을 임의로 비우지 않도록 영구 보관 요청 */
export async function requestPersist(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* 지원 안 함 */
  }
  return false;
}

export const storageMode = () => (useFallback ? 'localStorage' : 'IndexedDB');
