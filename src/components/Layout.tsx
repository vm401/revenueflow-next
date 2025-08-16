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
          <header className="h-16 border-b border-border bg-navbar-background text-navbar-foreground flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-navbar-foreground hover:text-accent" />
              
              {/* Breadcrumb */}
              <nav className="flex items-center text-sm text-navbar-foreground/70">
                <span className="font-heading font-medium">Moloco CRM</span>
                <span className="mx-2">/</span>
                <span className="text-navbar-foreground font-heading">Overview</span>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-navbar-foreground/20 text-navbar-foreground hover:bg-navbar-foreground/10">
                  Save chart
                </Button>
                <Button variant="outline" size="sm" className="border-navbar-foreground/20 text-navbar-foreground hover:bg-navbar-foreground/10">
                  Share
                </Button>
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Export
                </Button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-navbar-foreground hover:bg-navbar-foreground/10">
                  <Bell className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-2 cursor-pointer hover:bg-navbar-foreground/10 rounded-lg px-2 py-1 transition-colors">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <span className="text-sm font-medium text-navbar-foreground">Account</span>
                  <ChevronDown className="w-4 h-4 text-navbar-foreground/70" />
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