// 가벼운 화면 설정은 localStorage 에 저장 (기록 데이터는 IndexedDB)
import { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

export function usePref<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

export function applyTheme(theme: Theme) {
  const dark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', dark ? '#1c1917' : '#0f766e');
  try {
    localStorage.setItem('cn.theme', theme); // index.html 의 깜빡임 방지 스크립트용 (문자열)
  } catch {
    /* ignore */
  }
}
