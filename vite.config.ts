import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

// 아이폰 홈 화면 아이콘을 HTML 안에 직접 넣음(data URI) → 아이콘 파일을 못 받아와
// '어' 글자 아이콘으로 대체되는 문제를 원천 차단
const inlineTouchIcon = (): Plugin => ({
  name: 'inline-apple-touch-icon',
  transformIndexHtml(html) {
    const b64 = readFileSync('public/icons/apple-touch-icon-v2.png').toString('base64');
    return html.replace(
      '<!--apple-touch-icon-->',
      `<link rel="apple-touch-icon" sizes="180x180" href="data:image/png;base64,${b64}" />`,
    );
  },
});

// GitHub Pages 에서는 /저장소이름/ 하위 경로로 서비스되므로
// 배포 워크플로가 BASE_PATH 환경변수를 넘겨줍니다. (로컬 개발은 '/')
const base = process.env.BASE_PATH || '/';

// 설정 화면 하단에 표시되는 빌드 시각 (최신 버전인지 확인용, 한국시간)
const buildTime = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');

export default defineConfig({
  base,
  define: { __BUILD_TIME__: JSON.stringify(buildTime) },
  plugins: [
    react(),
    inlineTouchIcon(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // 새 버전 배포 시 자동 갱신
      injectRegister: 'script', // 서비스워커 등록 스크립트 자동 삽입
      // 매니페스트 파일 이름을 바꿔 폰·브라우저에 남은 예전 매니페스트(예전 아이콘)를 우회
      manifestFilename: 'app-v3.webmanifest',
      manifest: {
        name: '어디서 먹고 자지?',
        short_name: '어디서먹고자지',
        description: '전국 출장·외근용 맛집·숙소·휴게소 10초 기록 앱',
        lang: 'ko',
        id: `${base}?app=v3`, // 앱 고유 ID를 새로 지정해 폰에 남은 예전 앱 정보(아이콘)와 분리
        start_url: `${base}?home=v3`, // 시작 주소를 바꿔 아이폰이 기억하는 예전 아이콘과 분리
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#2D2A78',
        theme_color: '#0f766e',
        icons: [
          { src: 'icons/pwa-192-v2.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/pwa-512-v2.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512-v2.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 화면(HTML)은 미리 저장하지 않고 '인터넷 먼저' → 새 버전이 바로 반영됨.
        // 오프라인일 때만 마지막으로 받아 둔 화면을 씀.
        globPatterns: ['**/*.{js,css}'], // 아이콘·매니페스트는 서비스워커를 거치지 않고 항상 인터넷에서 받음
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages', networkTimeoutSeconds: 4 },
          },
        ],
      },
    }),
  ],
});
