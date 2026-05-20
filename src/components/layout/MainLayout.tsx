import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { WelcomePopup } from '@/components/WelcomePopup';

export function MainLayout(): JSX.Element {
  return (
    <div className="min-h-full flex bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 pb-16 lg:pb-0">
          <div className="px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
      <MobileNav />
      <WelcomePopup />
    </div>
  );
}
