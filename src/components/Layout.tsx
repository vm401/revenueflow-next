import { ReactNode, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CrmSidebar } from "./CrmSidebar";
import { User, ChevronDown } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CrmSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-navbar-background text-navbar-foreground flex items-center justify-end px-6">
            {/* User Menu */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-navbar-foreground/10 rounded-lg px-2 py-1 transition-colors">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium text-navbar-foreground">Account</span>
              <ChevronDown className="w-4 h-4 text-navbar-foreground/70" />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}