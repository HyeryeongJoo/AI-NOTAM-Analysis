/**
 * 앱 셸 컴포넌트
 *
 * TopNavigation(AppLayout 외부) + AppLayout with SideNavigation, Breadcrumbs, Flashbar.
 * 모든 페이지를 감싸는 최상위 레이아웃 컴포넌트.
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Flashbar from '@cloudscape-design/components/flashbar';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

/** 경로-이름 매핑 (breadcrumb용) */
const ROUTE_LABELS: Record<string, string> = {
  '/': '대시보드',
  '/notams': 'NOTAM 목록',
  '/flights': '운항편',
  '/routes': '항로 목록',
  '/ref-book': 'REF BOOK',
  '/briefings': '브리핑 문서',
  '/decisions': '의사결정 기록',
  '/audit-log': '감사 로그',
};

/** 상세 페이지 라벨 */
const DETAIL_LABELS: Record<string, string> = {
  notams: 'NOTAM 상세',
  flights: '운항편 상세',
  routes: '항로 상세',
  briefings: '브리핑 상세',
};

/**
 * 앱 셸 레이아웃 컴포넌트
 *
 * @param props - children을 포함하는 props
 * @param props.children - 페이지 컨텐츠
 * @returns 전체 앱 레이아웃
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getUnacknowledgedAlerts } = useAlert();
  const { notifications } = useNotification();

  const hasUnacknowledgedAlerts = getUnacknowledgedAlerts().length > 0;

  /** SideNavigation 메뉴 구조 */
  const sideNavItems = useMemo(
    () => [
      {
        type: 'section' as const,
        text: '운항 현황',
        items: [
          { type: 'link' as const, text: '대시보드', href: '/' },
          { type: 'link' as const, text: 'NOTAM 목록', href: '/notams' },
          { type: 'link' as const, text: '운항편', href: '/flights' },
        ],
      },
      {
        type: 'section' as const,
        text: '항로 관리',
        items: [{ type: 'link' as const, text: '항로 목록', href: '/routes' }],
      },
      {
        type: 'section' as const,
        text: '문서 관리',
        items: [
          { type: 'link' as const, text: 'REF BOOK', href: '/ref-book' },
          { type: 'link' as const, text: '브리핑 문서', href: '/briefings' },
        ],
      },
      {
        type: 'section' as const,
        text: '관리',
        items: [
          { type: 'link' as const, text: '의사결정 기록', href: '/decisions' },
          { type: 'link' as const, text: '감사 로그', href: '/audit-log' },
        ],
      },
    ],
    [],
  );

  /** 현재 경로 기반 breadcrumb 생성 */
  const breadcrumbItems = useMemo(() => {
    const items = [{ text: '대시보드', href: '/' }];

    if (pathname === '/') return items;

    const segments = pathname.split('/').filter(Boolean);
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      if (ROUTE_LABELS[currentPath]) {
        items.push({ text: ROUTE_LABELS[currentPath], href: currentPath });
      } else if (index > 0) {
        // 상세 페이지 (동적 라우트)
        const parentSegment = segments[index - 1];
        const label = DETAIL_LABELS[parentSegment] ?? segment;
        items.push({ text: label, href: currentPath });
      }
    });

    return items;
  }, [pathname]);

  /** 현재 라우트에 맞는 contentType */
  const contentType = useMemo(() => {
    if (pathname === '/') return 'dashboard' as const;
    const tableRoutes = [
      '/notams',
      '/flights',
      '/routes',
      '/ref-book',
      '/briefings',
      '/decisions',
      '/audit-log',
    ];
    if (tableRoutes.includes(pathname)) return 'table' as const;
    return 'default' as const;
  }, [pathname]);

  const handleNavFollow = useCallback(
    (event: CustomEvent<{ href: string }>) => {
      event.preventDefault();
      router.push(event.detail.href);
    },
    [router],
  );

  const handleBreadcrumbFollow = useCallback(
    (event: CustomEvent<{ href: string }>) => {
      event.preventDefault();
      router.push(event.detail.href);
    },
    [router],
  );

  return (
    <>
      <TopNavigation
        identity={{ title: 'NOTAM 분석 시스템', href: '/' }}
        utilities={[
          {
            type: 'button',
            iconName: 'notification',
            title: '알림',
            ariaLabel: '알림',
            badge: hasUnacknowledgedAlerts,
          },
          {
            type: 'button',
            text: '교대 근무: 주간',
            iconName: 'user-profile',
          },
          {
            type: 'menu-dropdown',
            text: user?.name ?? '로그인',
            iconName: 'user-profile',
            items: [{ id: 'signout', text: '로그아웃' }],
            onItemClick: ({ detail }) => {
              if (detail.id === 'signout') logout();
            },
          },
        ]}
      />
      <AppLayout
        navigation={
          <SideNavigation
            header={{ text: 'NOTAM 분석', href: '/' }}
            activeHref={pathname}
            items={sideNavItems}
            onFollow={handleNavFollow}
          />
        }
        breadcrumbs={<BreadcrumbGroup items={breadcrumbItems} onFollow={handleBreadcrumbFollow} />}
        notifications={<Flashbar items={notifications} />}
        content={children}
        contentType={contentType}
        toolsHide={true}
      />
    </>
  );
}
