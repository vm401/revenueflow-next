import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  ShoppingBag,
  Target,
  Settings,
  FileText,
  Upload,
  LayoutDashboard,
  Database,
  Layers,
  TrendingUp,
  Search,
  HelpCircle,
  User
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Charts", url: "/charts", icon: BarChart3 },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Product catalog", url: "/product-catalog", icon: ShoppingBag },
  { title: "Paywalls", url: "/paywalls", icon: FileText },
  { title: "Targeting", url: "/targeting", icon: Target },
  { title: "Experiments", url: "/experiments", icon: TrendingUp },
  { title: "Customer center", url: "/customer-center", icon: User },
];

const bottomMenuItems = [
  { title: "Apps & providers", url: "/apps", icon: Layers },
  { title: "API keys", url: "/api-keys", icon: Database },
  { title: "Integrations", url: "/integrations", icon: Upload },
  { title: "Project settings", url: "/settings", icon: Settings },
];

export function CrmSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive: active }: { isActive: boolean }) =>
    active 
      ? "bg-sidebar-accent text-sidebar-primary font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent className="bg-sidebar-background border-r border-sidebar-border">
        {/* Project Selector */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MC</span>
            </div>
            {!collapsed && (
              <div>
                <p className="text-sidebar-foreground font-medium">Moloco CRM</p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidebar-foreground/60" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/60 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
              />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Help */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 text-sidebar-foreground/60">
              <HelpCircle className="w-4 h-4" />
              {!collapsed && <span className="text-sm">Help</span>}
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}