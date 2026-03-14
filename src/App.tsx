import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./context/LanguageContext";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Translation from "./pages/Translation";
import Features from "./pages/Features";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Auth from "./pages/Auth";
import UserGuide from "./pages/UserGuide";
import GestureLibrary from "./pages/GestureLibrary";
import ApiDocumentation from "./pages/ApiDocumentation";
import CommunityForum from "./pages/CommunityForum";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import { AdminGuard } from "./components/admin/AdminGuard";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageGestures from "./pages/admin/ManageGestures";
import UserManagement from "./pages/admin/UserManagement";
import InterpretationLogs from "./pages/admin/InterpretationLogs";
import Reports from "./pages/admin/Reports";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/translate" element={<Translation />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/user-guide" element={<UserGuide />} />
              <Route path="/gesture-library" element={<GestureLibrary />} />
              <Route path="/api-docs" element={<ApiDocumentation />} />
              <Route path="/community-forum" element={<CommunityForum />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              {/* Admin Routes – only users with role "admin" can access */}
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="gestures" element={<ManageGestures />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="logs" element={<InterpretationLogs />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
