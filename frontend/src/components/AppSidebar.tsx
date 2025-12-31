import { useState, useMemo, useCallback } from "react";
import {
  Settings,
  Database,
  BarChart3,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  ChevronDown,
  Plug,
  TrendingUp,
  LayoutGrid
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useIntegrations } from "@/contexts/IntegrationsContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/product", icon: LayoutGrid },
  { title: "Dados", url: "/product/meta/dados", icon: Database },
  { title: "Integrações", url: "/product/integrations", icon: Plug },
  { title: "Configurações", url: "/product/settings", icon: Settings },
] as const;

const integrationItems = [
  { title: "Facebook Ads", icon: Facebook, color: "text-blue-600 dark:text-blue-400", type: "facebook" },
  { title: "Google Ads", icon: Globe, color: "text-red-500 dark:text-red-400", type: "google" },
  { title: "Instagram", icon: Instagram, color: "text-pink-600 dark:text-pink-400", type: "instagram" },
  { title: "LinkedIn Ads", icon: Linkedin, color: "text-blue-700 dark:text-blue-500", type: "linkedin" },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [integrationsOpen, setIntegrationsOpen] = useState(true);
  const { integrations } = useIntegrations();

  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;

  const handleIntegrationsToggle = useCallback((open: boolean) => {
    setIntegrationsOpen(open);
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="flex flex-col h-full overflow-hidden">
        
        {/* Header Branding - Modern SaaS Style */}
        <div className="flex items-center justify-between p-6">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isCollapsed && "opacity-0 w-0 overflow-hidden"
          )}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sidebar-primary-foreground font-bold text-lg shadow-lg shadow-blue-500/30">
               L
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                Lux Analytics
              </span>
              <span className="text-[11px] font-medium text-sidebar-foreground uppercase tracking-wider">
                Enterprise
              </span>
            </div>
          </div>
          
          <SidebarTrigger 
            className={cn(
              "h-8 w-8 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground flex items-center justify-center shadow-sm",
              isCollapsed && "mx-auto"
            )}
          />
        </div>

        {/* Separator */}
        <div className="h-px bg-sidebar-border mx-6 mb-6" />

        {/* Menu Principal */}
        <SidebarGroup className="px-4">
          <SidebarGroupLabel className={cn(
            "text-[11px] font-bold text-sidebar-foreground uppercase tracking-widest px-4 mb-2",
            isCollapsed && "sr-only"
          )}>
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = item.url === "/product" 
                  ? currentPath === "/product"
                  : currentPath.startsWith(item.url);
                  
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} className="h-auto p-0 hover:bg-transparent">
                      <NavLink
                        to={item.url}
                        end={item.url === "/product"}
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-3 rounded-full group transition-none",
                          isActive 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20 font-medium" 
                            : "text-sidebar-foreground font-medium hover:bg-sidebar-accent"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110", isCollapsed ? "mx-auto" : "")} />
                        {!isCollapsed && (
                          <span className="text-[15px]">
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Integrações */}
        {!isCollapsed && (
          <div className="mt-8 px-4">
             <Collapsible 
              open={integrationsOpen} 
              onOpenChange={handleIntegrationsToggle}
              className="space-y-2"
            >
              <div className="flex items-center justify-between px-4 mb-2">
                <span className="text-[11px] font-bold text-sidebar-foreground uppercase tracking-widest">
                  Conexões Ativas
                </span>
                <CollapsibleTrigger asChild>
                  <button className="text-sidebar-foreground hover:text-sidebar-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent">
                     <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", integrationsOpen ? "rotate-0" : "-rotate-90")} />
                  </button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="space-y-1 data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                {integrationItems.map((item) => {
                  const isConnected = integrations.some(i => i.type === item.type && i.status === 'connected');
                  
                  return (
                    <div key={item.title} className="group flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer border border-transparent hover:border-sidebar-border">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 rounded-lg bg-sidebar-accent", item.color)}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-foreground transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-300",
                          isConnected 
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                            : "bg-sidebar-foreground/20"
                        )} />
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Footer / User Profile (Optional) */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
           {!isCollapsed && (
             <div className="flex items-center gap-3 p-3 rounded-2xl bg-sidebar-accent border border-sidebar-border">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground">
                  JS
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-sidebar-foreground truncate">João Silva</span>
                  <span className="text-[10px] text-sidebar-foreground/80 truncate">joao@empresa.com</span>
                </div>
             </div>
           )}
        </div>

      </SidebarContent>
    </Sidebar>
  );
}
