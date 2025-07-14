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
  ChevronRight,
  ChevronLeft,
  Plug,
  TrendingUp
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

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
  { title: "Dashboard", url: "/product", icon: BarChart3 },
  { title: "Dados Meta Ads", url: "/product/meta/dados", icon: TrendingUp },
  { title: "Integrações", url: "/product/integrations", icon: Plug },
  { title: "Configurações", url: "/product/settings", icon: Settings },
] as const;

const integrationItems = [
  { title: "Facebook Ads", icon: Facebook },
  { title: "Google Ads", icon: Globe },
  { title: "Instagram", icon: Instagram },
  { title: "LinkedIn Ads", icon: Linkedin },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [integrationsOpen, setIntegrationsOpen] = useState(true);

  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;

  const isActive = useCallback((path: string) => {
    return currentPath === path || (path === "/product" && currentPath === "/product");
  }, [currentPath]);

  const getNavClassName = useMemo(() => {
    return ({ isActive }: { isActive: boolean }) =>
      isActive 
        ? "bg-muted text-primary font-medium" 
        : "hover:bg-muted/50";
  }, []);

  const handleIntegrationsToggle = useCallback((open: boolean) => {
    setIntegrationsOpen(open);
  }, []);

  return (
    <Sidebar collapsible="icon" className="transition-all duration-300 ease-in-out">
      <SidebarContent className="bg-background border-r border-border overflow-x-hidden">
        
        {/* Header com informações da plataforma */}
        <div className="relative p-4 border-b border-border">
          <div className={cn(
            "transition-opacity duration-300",
            isCollapsed && "opacity-0 pointer-events-none"
          )}>
            <h2 className="text-lg font-semibold text-foreground">
              DashboardAI
            </h2>
            <p className="text-sm text-muted-foreground">
              Analytics Platform
            </p>
          </div>
          
          {/* Botão de toggle posicionado corretamente */}
          <div className="absolute top-2 right-2">
            <SidebarTrigger 
              className="h-8 w-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
            />
          </div>
        </div>

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel 
            className={cn(
              "transition-opacity duration-300",
              isCollapsed && "sr-only"
            )}
          >
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/product"}
                      className={getNavClassName}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="transition-opacity duration-300">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Integrações Ativas - só mostra quando expandido */}
        {!isCollapsed && (
          <SidebarGroup className="transition-opacity duration-300">
            <Collapsible 
              open={integrationsOpen} 
              onOpenChange={handleIntegrationsToggle}
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className="w-full justify-between hover:bg-muted/50 transition-colors duration-200"
                  aria-expanded={integrationsOpen}
                  aria-controls="integrations-content"
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Integrações Ativas</span>
                  </div>
                  <div className={cn(
                    "transform transition-transform duration-200",
                    integrationsOpen && "rotate-180"
                  )}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent 
                id="integrations-content"
                className="transition-all duration-300 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
              >
                <SidebarGroupContent>
                  <SidebarMenu className="ml-4">
                    {integrationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                          <item.icon className="h-3 w-3" />
                          <span>{item.title}</span>
                          <div className="ml-auto">
                            <div 
                              className="w-2 h-2 bg-muted rounded-full transition-colors duration-200"
                              aria-label="Status da integração"
                            />
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}