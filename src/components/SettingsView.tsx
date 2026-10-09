import { useRef, useState } from 'react';
import { Download, Monitor, Moon, Share, Smartphone, Sun, Trash2, Upload } from 'lucide-react';
import type { Place } from '../types';
import type { Theme } from '../lib/prefs';
import { exportJSON, lastBackupAt, mergePlaces, readBackupFile } from '../lib/backup';
import { Sheet } from './ui';

export function SettingsView({
  places,
  theme,
  setTheme,
  onReplaceAll,
  toast,
}: {
  places: Place[];
  theme: Theme;
  setTheme: (t: Theme) => void;
  onReplaceAll: (list: Place[]) => Promise<void>;
  toast: (m: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [lastBackup, setLastBackup] = useState(lastBackupAt());

  const food = places.filter((p) => p.category === 'food').length;
  const cafe = places.filter((p) => p.category === 'cafe').length;
  const stay = places.filter((p) => p.category === 'stay').length;
  const rest = places.filter((p) => p.category === 'rest').length;
  const regions = new Set(places.map((p) => `${p.sido} ${p.sigungu}`)).size;

  const onExport = () => {
    if (!places.length) return toast('내보낼 기록이 없어요');
    exportJSON(places);
    setLastBackup(Date.now());
    toast(`${places.length}건 백업 파일을 저장했어요`);
  };

  const [pending, setPending] = useState<Place[] | null>(null);
  const [clearArmed, setClearArmed] = useState(false);

  const onImport = async (file: File) => {
    try {
      const incoming = await readBackupFile(file);
      if (!places.length) {
        await onReplaceAll(incoming);
        toast(`${incoming.length}건을 가져왔어요`);
      } else {
        setPending(incoming); // 합치기/교체 선택 시트 열기
      }
    } catch (e) {
      toast(e instanceof Error ? `가져오기 실패: ${e.message}` : '가져오기 실패');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const applyImport = async (mode: 'merge' | 'replace') => {
    if (!pending) return;
    if (mode === 'replace') {
      await onReplaceAll(pending);
      toast(`${pending.length}건으로 교체했어요`);
    } else {
      const { list, added, updated } = mergePlaces(places, pending);
      await onReplaceAll(list);
      toast(`새 기록 ${added}건 · 갱신 ${updated}건 가져왔어요`);
    }
    setPending(null);
  };

  const days = lastBackup ? Math.floor((Date.now() - lastBackup) / 86400000) : null;

  const card = 'rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800';
  const h = 'mb-3 text-[15px] font-bold text-stone-500 dark:text-stone-400';

  return (
    <div className="space-y-3 px-4 pt-2 pb-6">
      <section className={card}>
        <h2 className={h}>내 기록</h2>
        <div className="grid grid-cols-5 text-center">
          {[
            ['식당', food],
            ['카페', cafe],
            ['숙소', stay],
            ['휴게소', rest],
            ['지역', regions],
          ].map(([l, n]) => (
            <div key={l as string}>
              <div className="text-3xl font-extrabold">{n}</div>
              <div className="mt-0.5 text-sm text-stone-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h}>화면 모드</h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['system', '시스템', Monitor],
              ['light', '라이트', Sun],
              ['dark', '다크', Moon],
            ] as const
          ).map(([v, l, Icon]) => (
            <button
              key={v}
              onClick={() => setTheme(v)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border text-[15px] font-bold ${
                theme === v
                  ? 'border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-800/30 dark:text-brand-100'
                  : 'border-stone-200 dark:border-stone-700'
              }`}
            >
              <Icon className="size-5" />
              {l}
            </button>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h}>백업 · 복원</h2>
        <p className="mb-3 text-[15px] text-stone-600 dark:text-stone-400">
          기록은 이 기기에만 저장돼요. 기기 변경·초기화에 대비해 가끔 백업 파일을 저장해 두세요.
          {days != null ? (
            <span className={`mt-1 block font-semibold ${days > 30 ? 'text-rose-600' : 'text-brand-700 dark:text-brand-500'}`}>
              마지막 백업: {days === 0 ? '오늘' : `${days}일 전`}
            </span>
          ) : (
            places.length > 0 && <span className="mt-1 block font-semibold text-rose-600">아직 백업한 적이 없어요</span>
          )}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExport}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-brand-700 text-[16px] font-bold text-white active:bg-brand-800"
          >
            <Download className="size-5" /> 내보내기
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-brand-700 text-[16px] font-bold text-brand-700 active:bg-brand-50 dark:text-brand-500 dark:active:bg-stone-800"
          >
            <Upload className="size-5" /> 가져오기
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
        />
      </section>

      <section className={card}>
        <h2 className={h}>홈 화면에 앱으로 추가</h2>
        <div className="space-y-3">
          <div className="rounded-2xl bg-stone-100 p-3.5 dark:bg-stone-800">
            <p className="mb-2 flex items-center gap-1.5 text-[15px] font-bold">
              <Smartphone className="size-4" /> 아이폰
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
              <li>
                <b>Safari</b>로 이 주소를 엽니다
              </li>
              <li>
                아래쪽 <b>공유</b> 버튼 <Share className="inline size-4 align-[-2px]" /> 을 누릅니다
              </li>
              <li>
                <b>홈 화면에 추가</b> → 오른쪽 위 <b>추가</b>
              </li>
            </ol>
          </div>
          <div className="rounded-2xl bg-stone-100 p-3.5 dark:bg-stone-800">
            <p className="mb-2 flex items-center gap-1.5 text-[15px] font-bold">
              <Smartphone className="size-4" /> 안드로이드
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
              <li>
                <b>크롬</b>으로 이 주소를 엽니다
              </li>
              <li>
                오른쪽 위 메뉴 <b>⋮</b> 를 누릅니다
              </li>
              <li>
                <b>홈 화면에 추가</b> 또는 <b>앱 설치</b> → <b>설치</b>
              </li>
            </ol>
          </div>
          <p className="text-[13px] text-stone-500">
            홈 화면에서 열면 주소창 없이 앱처럼 열리고, 인터넷이 없어도 기록을 볼 수 있어요.
          </p>
        </div>
      </section>

      <section className={card}>
        <button
          onClick={async () => {
            if (!places.length) return;
            if (!clearArmed) {
              setClearArmed(true);
              return;
            }
            setClearArmed(false);
            await onReplaceAll([]);
            toast('모든 기록을 삭제했어요');
          }}
          className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold ${
            clearArmed ? 'bg-rose-600 text-white' : 'text-rose-600 active:bg-rose-50 dark:active:bg-rose-950'
          }`}
        >
          <Trash2 className="size-4" />
          {clearArmed ? `한 번 더 누르면 ${places.length}건 모두 삭제` : '전체 기록 삭제'}
        </button>
        {clearArmed && (
          <button onClick={() => setClearArmed(false)} className="mt-1 min-h-11 w-full text-sm font-semibold text-stone-500">
            취소
          </button>
        )}
      </section>

      <Sheet open={!!pending} onClose={() => setPending(null)} title="백업 가져오기">
        <p className="mb-4 text-[16px]">
          백업 파일에서 <b>{pending?.length ?? 0}건</b>을 찾았어요. 현재 기록은 <b>{places.length}건</b>이에요.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => applyImport('merge')}
            className="min-h-14 w-full rounded-2xl bg-brand-700 text-[16px] font-bold text-white active:bg-brand-800"
          >
            현재 기록에 합치기 (권장)
          </button>
          <button
            onClick={() => applyImport('replace')}
            className="min-h-14 w-full rounded-2xl border border-rose-300 text-[16px] font-bold text-rose-600 dark:border-rose-900"
          >
            현재 {places.length}건 지우고 백업으로 교체
          </button>
          <button onClick={() => setPending(null)} className="min-h-12 w-full text-[15px] font-semibold text-stone-500">
            취소
          </button>
        </div>
      </Sheet>

      <p className="text-center text-xs text-stone-400">어디서 먹고 자지? · 업데이트 {__BUILD_TIME__}</p>
    </div>
  );
}
