import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PushNotificationToggle } from "@/components/notifications/PushNotificationToggle";
import { Loader2, Menu, ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface UserLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function UserLayout({ children, title, showBackButton, onBack }: UserLayoutProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          {/* Top header bar - Optimized for mobile */}
          <header className="sticky top-0 z-40 flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 md:px-4 shrink-0">
            {/* Mobile: Show back button or menu trigger */}
            {showBackButton && isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack || (() => navigate(-1))}
                className="shrink-0 -ml-1"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <SidebarTrigger className="shrink-0 -ml-1">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            )}
            
            {title && (
              <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
            )}

            <div className="flex-1" />

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {/* Hide push notification toggle on small mobile */}
              <div className="hidden sm:block">
                <PushNotificationToggle />
              </div>
              <NotificationBell />
            </div>
          </header>

          {/* Main content - Responsive padding */}
          <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
