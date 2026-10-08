/** 10000 → "10,000원" */
export const won = (n: number | null | undefined) => (n == null ? '' : `${n.toLocaleString('ko-KR')}원`);

/** 15000 → "1.5만", 8000 → "8천" (프리셋 버튼용) */
export const shortWon = (n: number) => {
  if (n >= 10000) {
    const man = n / 10000;
    return `${Number.isInteger(man) ? man : man.toFixed(1)}만`;
  }
  return `${n / 1000}천`;
};

/** 입력 문자열에서 숫자만: "1만2천" 같은 표기도 허용 */
export function parsePrice(raw: string): number | null {
  const s = raw.replace(/[,\s원]/g, '');
  if (!s) return null;
  const m = s.match(/^(?:(\d+(?:\.\d+)?)만)?(?:(\d+)천)?(\d*)$/);
  if (m && (m[1] || m[2])) {
    return Math.round((parseFloat(m[1] || '0') * 10000) + (parseInt(m[2] || '0', 10) * 1000) + parseInt(m[3] || '0', 10));
  }
  const n = parseInt(s.replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

export const todayStr = () => {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
