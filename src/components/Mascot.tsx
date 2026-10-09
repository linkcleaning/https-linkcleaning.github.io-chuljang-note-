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
      className="-my-1 -mr-1 grid size-12 shrink-0 place-items-center rounded-full active:scale-90"
    >
      <span key={hop} aria-hidden className="mascot text-[30px] leading-none">
        🧳
      </span>
    </button>
  );
}
