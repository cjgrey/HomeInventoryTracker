import { ReactNode } from "react";
import BottomNav from "@/components/bottom-nav";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mobile-container bg-background theme-transition">
      {/* Status bar safe area */}
      <div className="status-bar-safe" />
      
      {/* Main content */}
      <main className="px-6 pt-4 pb-24 min-h-screen custom-scrollbar overflow-y-auto">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav />
      
      {/* Bottom safe area */}
      <div className="bottom-safe" />
    </div>
  );
}
