import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { RouteLoader } from '@/components/RouteLoader';

// Code-split each page so the home-feed chunk doesn't have to ship the trade
// flow, the chart library, the form validation library, etc.
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const TokenDetailPage = lazy(() =>
  import('@/pages/TokenDetailPage').then((m) => ({ default: m.TokenDetailPage })),
);
const CreateTokenPage = lazy(() =>
  import('@/pages/CreateTokenPage').then((m) => ({ default: m.CreateTokenPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const HowItWorksPage = lazy(() =>
  import('@/pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })),
);
const CalloutsPage = lazy(() =>
  import('@/pages/CalloutsPage').then((m) => ({ default: m.CalloutsPage })),
);
const LivePage = lazy(() => import('@/pages/LivePage').then((m) => ({ default: m.LivePage })));
const SupportPage = lazy(() =>
  import('@/pages/SupportPage').then((m) => ({ default: m.SupportPage })),
);
const TerminalPage = lazy(() =>
  import('@/pages/TerminalPage').then((m) => ({ default: m.TerminalPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteLoader />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="/create"
          element={
            <Suspense fallback={<RouteLoader />}>
              <CreateTokenPage />
            </Suspense>
          }
        />
        <Route
          path="/token/:mint"
          element={
            <Suspense fallback={<RouteLoader />}>
              <TokenDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/profile/:address"
          element={
            <Suspense fallback={<RouteLoader />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <Suspense fallback={<RouteLoader />}>
              <HowItWorksPage />
            </Suspense>
          }
        />
        <Route
          path="/callouts"
          element={
            <Suspense fallback={<RouteLoader />}>
              <CalloutsPage />
            </Suspense>
          }
        />
        <Route
          path="/live"
          element={
            <Suspense fallback={<RouteLoader />}>
              <LivePage />
            </Suspense>
          }
        />
        <Route
          path="/support"
          element={
            <Suspense fallback={<RouteLoader />}>
              <SupportPage />
            </Suspense>
          }
        />
        <Route
          path="/terminal"
          element={
            <Suspense fallback={<RouteLoader />}>
              <TerminalPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteLoader />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
