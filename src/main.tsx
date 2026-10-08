import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// 서비스워커는 vite-plugin-pwa 가 빌드 시 registerSW.js 를 index.html 에 자동 삽입해 등록합니다.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
