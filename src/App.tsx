import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { NotificationsProvider } from "@/hooks/useNotifications";
import Index from "./pages/Index";
import Actualites from "./pages/Actualites";
import Sensibilisation from "./pages/Sensibilisation";
import Tutoriels from "./pages/Tutoriels";
import Demo from "./pages/Demo";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Grades from "./pages/Grades";
import Absences from "./pages/Absences";
import Schedule from "./pages/Schedule";
import Analytics from "./pages/Analytics";
import ReportCards from "./pages/ReportCards";
import Assignments from "./pages/Assignments";
import Chat from "./pages/Chat";
import Payments from "./pages/Payments";
import Appointments from "./pages/Appointments";
import Documents from "./pages/Documents";
import ClassGroups from "./pages/ClassGroups";
import SchoolCalendar from "./pages/Calendar";
import Resources from "./pages/Resources";
import ResourceAnalytics from "./pages/ResourceAnalytics";
import Competencies from "./pages/Competencies";
import DataExport from "./pages/DataExport";
import UsersManagement from "./pages/admin/UsersManagement";
import EstablishmentsManagement from "./pages/admin/EstablishmentsManagement";
import EstablishmentConfig from "./pages/admin/EstablishmentConfig";
import CommentModeration from "./pages/admin/CommentModeration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="idetude-theme">
      <AuthProvider>
        <NotificationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/actualites" element={<Actualites />} />
              <Route path="/sensibilisation" element={<Sensibilisation />} />
              <Route path="/tutoriels" element={<Tutoriels />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/connexion" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notes" element={<Grades />} />
              <Route path="/absences" element={<Absences />} />
              <Route path="/emploi-du-temps" element={<Schedule />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/bulletins" element={<ReportCards />} />
              <Route path="/devoirs" element={<Assignments />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/paiements" element={<Payments />} />
              <Route path="/rendez-vous" element={<Appointments />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/groupes" element={<ClassGroups />} />
              <Route path="/calendrier" element={<SchoolCalendar />} />
              <Route path="/ressources" element={<Resources />} />
              <Route path="/ressources/stats" element={<ResourceAnalytics />} />
              <Route path="/competences" element={<Competencies />} />
              <Route path="/export" element={<DataExport />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/establishments" element={<EstablishmentsManagement />} />
              <Route path="/admin/establishments/config" element={<EstablishmentConfig />} />
              <Route path="/admin/moderation" element={<CommentModeration />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationsProvider>
    </AuthProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
