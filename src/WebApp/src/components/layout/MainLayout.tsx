import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { ChatWidget } from '@/features/ai-chat';

interface MainLayoutProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string | null;
  onSelectCategory?: (id: string | null) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] text-slate-900 w-full max-w-full overflow-x-clip">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <ChatWidget />
      <Footer />
    </div>
  );
};
