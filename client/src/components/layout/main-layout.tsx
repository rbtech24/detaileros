import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { Redirect } from "wouter";
import { AiAssistant } from "@/components/ai-assistant";

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function MainLayout({ children, requireAuth = true }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  // If authentication is required and the user is not authenticated, redirect to login
  if (requireAuth && !loading && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar with Sheet component */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[250px]">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation - Desktop & Mobile */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {children}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* AI Assistant */}
        {isAuthenticated && <AiAssistant />}
      </main>
    </div>
  );
}
