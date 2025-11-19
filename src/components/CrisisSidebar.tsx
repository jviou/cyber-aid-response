import { NavLink, useLocation } from "react-router-dom";
import { Home, Gavel, MessageSquare, FileText, Shield, Book, Info } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface CrisisSidebarProps {
  sessionMode?: "exercise" | "real";
}

export function CrisisSidebar({ sessionMode }: CrisisSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();

  const mainNavItems = [
    { title: "Introduction", url: "/introduction", icon: Info },
    { title: "Accueil", url: "/dashboard", icon: Home },
    { title: "RIDA", url: "/decisions", icon: Gavel },
    { title: "Communications", url: "/communications", icon: MessageSquare },
    { title: "Ressources", url: "/resources", icon: FileText },
    { title: "Glossaire", url: "/glossary", icon: Book },
  ];

  const phaseItems = [
    { title: "Phase 1", url: "/phases/1", subtitle: "Mobiliser", color: "phase-1" },
    { title: "Phase 2", url: "/phases/2", subtitle: "Confiance", color: "phase-2" },
    { title: "Phase 3", url: "/phases/3", subtitle: "Relancer", color: "phase-3" },
    { title: "Phase 4", url: "/phases/4", subtitle: "Capitaliser", color: "phase-4" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const getNavClassName = (isActive: boolean) => 
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      isActive 
        ? "bg-primary text-primary-foreground font-medium" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"}>
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!state || state === "expanded" ? (
              <div>
                <h2 className="font-semibold text-sm">Crisis Manager</h2>
                {sessionMode && (
                  <Badge 
                    variant={sessionMode === "real" ? "destructive" : "default"} 
                    className="text-xs mt-1"
                  >
                    {sessionMode === "real" ? "RÉEL" : "EXERCICE"}
                  </Badge>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={({ isActive }) => getNavClassName(isActive)}
                    >
                      <item.icon className="w-4 h-4" />
                      {(!state || state === "expanded") && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Phases Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Phases de Crise</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phaseItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => getNavClassName(isActive)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-${item.color} opacity-80`}
                      />
                      {(!state || state === "expanded") && (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}