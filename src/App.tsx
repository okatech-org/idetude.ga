import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import UsersManagement from "./pages/admin/UsersManagement";
import EstablishmentsManagement from "./pages/admin/EstablishmentsManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/establishments" element={<EstablishmentsManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
