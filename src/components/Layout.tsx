import { ReactNode, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CrmSidebar } from "./CrmSidebar";
import { User, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-foreground" />
              
              {/* Breadcrumb */}
              <nav className="flex items-center text-sm text-muted-foreground">
                <span>Moloco CRM</span>
                <span className="mx-2">/</span>
                <span className="text-foreground">Overview</span>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Save chart
                </Button>
                <Button variant="outline" size="sm">
                  Share
                </Button>
                <Button size="sm">
                  Export
                </Button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">Account</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
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