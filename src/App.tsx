import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { CreationMethodProvider } from "@/hooks/useCreationMethodConfig";
import Index from "./pages/Index";
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
import EstablishmentManage from "./pages/admin/EstablishmentManage";
import CommentModeration from "./pages/admin/CommentModeration";
import CountriesManagement from "./pages/admin/CountriesManagement";
import RegionsManagement from "./pages/admin/RegionsManagement";
import SchoolGroupsManagement from "./pages/admin/SchoolGroupsManagement";
import GlobalAnalytics from "./pages/admin/GlobalAnalytics";
import ActivityLog from "./pages/admin/ActivityLog";
import GlobalExport from "./pages/admin/GlobalExport";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
// Persona pages
import Etablissements from "./pages/Etablissements";
import Parents from "./pages/Parents";
import Professeurs from "./pages/Professeurs";
import Eleves from "./pages/Eleves";
import PublicEstablishmentPage from "./pages/public/PublicEstablishmentPage";

const queryClient = new QueryClient();

// Création du router avec les future flags v7
const router = createBrowserRouter(
  [
    { path: "/", element: <Index /> },
    { path: "/tutoriels", element: <Tutoriels /> },
    { path: "/demo", element: <Demo /> },
    // Persona pages
    { path: "/etablissements", element: <Etablissements /> },
    { path: "/parents", element: <Parents /> },
    { path: "/professeurs", element: <Professeurs /> },
    { path: "/eleves", element: <Eleves /> },
    { path: "/etablissement/:slug", element: <PublicEstablishmentPage /> },
    { path: "/etablissement/:slug/:pageSlug", element: <PublicEstablishmentPage /> },
    { path: "/auth", element: <Auth /> },
    { path: "/connexion", element: <Auth /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/messages", element: <Messages /> },
    { path: "/notes", element: <Grades /> },
    { path: "/absences", element: <Absences /> },
    { path: "/emploi-du-temps", element: <Schedule /> },
    { path: "/analytics", element: <Analytics /> },
    { path: "/bulletins", element: <ReportCards /> },
    { path: "/devoirs", element: <Assignments /> },
    { path: "/chat", element: <Chat /> },
    { path: "/paiements", element: <Payments /> },
    { path: "/rendez-vous", element: <Appointments /> },
    { path: "/documents", element: <Documents /> },
    { path: "/groupes", element: <ClassGroups /> },
    { path: "/calendrier", element: <SchoolCalendar /> },
    { path: "/ressources", element: <Resources /> },
    { path: "/ressources/stats", element: <ResourceAnalytics /> },
    { path: "/competences", element: <Competencies /> },
    { path: "/export", element: <DataExport /> },
    { path: "/admin/users", element: <UsersManagement /> },
    { path: "/admin/establishments", element: <EstablishmentsManagement /> },
    { path: "/admin/establishments/config", element: <EstablishmentConfig /> },
    { path: "/admin/establishments/manage", element: <EstablishmentManage /> },
    { path: "/admin/moderation", element: <CommentModeration /> },
    { path: "/admin/countries", element: <CountriesManagement /> },
    { path: "/admin/regions", element: <RegionsManagement /> },
    { path: "/admin/groups", element: <SchoolGroupsManagement /> },
    { path: "/admin/analytics", element: <GlobalAnalytics /> },
    { path: "/admin/activity", element: <ActivityLog /> },
    { path: "/admin/export", element: <GlobalExport /> },
    { path: "/admin/settings", element: <AdminSettings /> },
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="idetude-theme">
      <AuthProvider>
        <NotificationsProvider>
          <CreationMethodProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <RouterProvider router={router} />
            </TooltipProvider>
          </CreationMethodProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
