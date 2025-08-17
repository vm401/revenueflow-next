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
  User,
  Zap,
  Globe,
  Palette,
  Activity,
  PieChart,
  Briefcase,
  Plug,
  Link,
  ChevronLeft,
  ChevronRight
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
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, font: "font-display" },
  { title: "Overview", url: "/overview", icon: Activity, font: "font-sans" },
  { title: "Campaigns", url: "/campaigns", icon: Zap, font: "font-display" },
  { title: "Creatives", url: "/creatives", icon: Palette, font: "font-sans" },
  { title: "Apps", url: "/apps", icon: Briefcase, font: "font-display" },
  { title: "Exchanges", url: "/exchanges", icon: Globe, font: "font-sans" },
  { title: "Inventory", url: "/inventory", icon: Database, font: "font-mono" },
  { title: "Upload", url: "/upload", icon: Upload, font: "font-mono" },
  { title: "Integrations", url: "/integrations", icon: Plug, font: "font-display" },
];

const bottomMenuItems = [
  { title: "Settings", url: "/settings", icon: Settings, font: "font-mono" },
];

export function CrmSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive: active }: { isActive: boolean }) =>
    active 
      ? "bg-accent/20 text-white font-medium" 
      : "text-white/80 hover:bg-accent/10 hover:text-white";

  return (
    <Sidebar className={`${collapsed ? "w-20" : "w-64"} transition-all duration-300`}>
      <SidebarContent className="bg-sidebar-background border-r border-sidebar-border">
        {/* Project Selector */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">MC</span>
              </div>
              {!collapsed && (
                <div>
                  <p className="text-white font-display font-semibold">Moloco CRM</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent/50"
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
                      <item.icon className={`${collapsed ? "w-6 h-6" : "w-5 h-5"}`} />
                      {!collapsed && <span className={item.font}>{item.title}</span>}
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
                        <item.icon className={`${collapsed ? "w-6 h-6" : "w-5 h-5"}`} />
                        {!collapsed && <span className={item.font}>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Help */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 text-white/60">
              <HelpCircle className={`${collapsed ? "w-6 h-6" : "w-5 h-5"}`} />
              {!collapsed && <span className="text-sm font-mono">Help</span>}
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}