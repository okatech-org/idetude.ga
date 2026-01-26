import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PushNotificationToggle } from "@/components/notifications/PushNotificationToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Mail,
  BookOpen,
  ClipboardList,
  UserX,
  Calendar,
  CreditCard,
  CalendarDays,
  FolderOpen,
  Users,
  CalendarCheck,
  BarChart3,
  FileText,
  Shield,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
  BookMarked,
  Award,
  Download,
} from "lucide-react";

const mainMenuItems = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Messages", url: "/messages", icon: Mail },
  { title: "Chat", url: "/chat", icon: MessageSquare },
];

const academicMenuItems = [
  { title: "Notes", url: "/notes", icon: BookOpen },
  { title: "Devoirs", url: "/devoirs", icon: ClipboardList },
  { title: "Absences", url: "/absences", icon: UserX },
  { title: "Emploi du temps", url: "/emploi-du-temps", icon: Calendar },
  { title: "Bulletins", url: "/bulletins", icon: FileText },
  { title: "Compétences", url: "/competences", icon: Award },
];

const resourceMenuItems = [
  { title: "Ressources", url: "/ressources", icon: BookMarked },
  { title: "Documents", url: "/documents", icon: FolderOpen },
  { title: "Calendrier", url: "/calendrier", icon: CalendarCheck },
  { title: "Groupes", url: "/groupes", icon: Users },
];

const managementMenuItems = [
  { title: "Paiements", url: "/paiements", icon: CreditCard },
  { title: "Rendez-vous", url: "/rendez-vous", icon: CalendarDays },
  { title: "Analytique", url: "/analytics", icon: BarChart3 },
  { title: "Export", url: "/export", icon: Download },
];

const adminMenuItems = [
  { title: "Utilisateurs", url: "/admin/users", icon: Users },
  { title: "Établissements", url: "/admin/establishments", icon: Building2 },
  { title: "Modération", url: "/admin/moderation", icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, roles, signOut } = useAuth();

  const isSuperAdmin = roles.includes("super_admin");
  const isSchoolAdmin = roles.includes("school_admin");
  const isAdmin = isSuperAdmin || isSchoolAdmin;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const renderMenuItems = (items: typeof mainMenuItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink 
              to={item.url} 
              end 
              className="flex items-center gap-3"
              activeClassName="bg-primary/10 text-primary"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-foreground">iDETUDE</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Academic */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Scolarité
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(academicMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Ressources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(resourceMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Gestion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(managementMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(collapsed ? "sr-only" : "", "text-destructive")}>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(adminMenuItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-3">
        <div className={cn(
          "flex items-center gap-3",
          collapsed ? "justify-center" : ""
        )}>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {roles[0] ? roles[0].replace("_", " ") : "Utilisateur"}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
