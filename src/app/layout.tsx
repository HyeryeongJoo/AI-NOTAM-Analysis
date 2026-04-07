/**
 * 루트 레이아웃
 *
 * Cloudscape 전역 스타일, 컨텍스트 프로바이더, AppShell을 적용하는 최상위 레이아웃.
 *
 * @route /
 */

import '@cloudscape-design/global-styles/index.css';

import AppShell from '@/components/layout/AppShell';
import Providers from '@/components/layout/Providers';
import type { Metadata } from 'next';

/** 사이트 메타데이터 */
export const metadata: Metadata = {
  title: 'Jeju Air AI NOTAM Analysis System',
  description: '제주항공 AI 기반 NOTAM 분석 시스템 프로토타입',
};

/**
 * 루트 레이아웃 컴포넌트
 *
 * @param props - children을 포함하는 props
 * @param props.children - 페이지 컴포넌트
 * @returns 루트 HTML 구조
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://a.tile.openstreetmap.org" />
        <link rel="preconnect" href="https://b.tile.openstreetmap.org" />
        <link rel="preconnect" href="https://c.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://a.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://b.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://c.tile.openstreetmap.org" />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
