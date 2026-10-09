// 캐리어 마스코트: 누르면 목소리 재생 + 통통 튀는 동작
import { useRef, useState } from 'react';

const SOUND_URL = `${import.meta.env.BASE_URL}sounds/mascot.mp3`;

export function MascotButton() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hop, setHop] = useState(0);

  const play = () => {
    setHop((n) => n + 1); // key 를 바꿔 애니메이션을 처음부터 다시
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUND_URL);
        audioRef.current.preload = 'auto';
      }
      const a = audioRef.current;
      a.currentTime = 0;
      void a.play().catch(() => {
        /* 무음 모드·권한 등으로 재생이 막혀도 동작은 그대로 */
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={play}
      aria-label="마스코트 캐리어 (누르면 소리)"
      className="mascot-float fixed z-40 grid size-14 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg ring-1 ring-stone-200 backdrop-blur active:scale-90 dark:bg-stone-800/90 dark:ring-stone-700"
    >
      <span key={hop} aria-hidden className="mascot text-[32px] leading-none">
        🧳
      </span>
    </button>
  );
}
