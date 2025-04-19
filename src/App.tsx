
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import our pages
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LandingPage from "./pages/landing/LandingPage";
import UploadPage from "./pages/upload";
import CampaignsPage from "./pages/campaigns";
import ManageCampaignsPage from "./pages/campaigns/manage";
import CreateCampaignPage from "./pages/campaigns/create";
import AddLeadPage from "./pages/leads/add";
import AnalyticsPage from "./pages/analytics";
import LeadGeneratorPage from "./pages/lead-generator";
import DemoPage from "./pages/demo/DemoPage";
import ComingSoonPage from "./pages/demo/ComingSoonPage";
import SettingsPage from "./pages/settings";
import VoipPage from "./pages/voip";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Login />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/demo/coming-soon" element={<ComingSoonPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="/leads/add" element={
              <ProtectedRoute>
                <AddLeadPage />
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <CampaignsPage />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/manage" element={
              <ProtectedRoute>
                <ManageCampaignsPage />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/create" element={
              <ProtectedRoute>
                <CreateCampaignPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/lead-generator" element={
              <ProtectedRoute>
                <LeadGeneratorPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/voip" element={
              <ProtectedRoute>
                <VoipPage />
              </ProtectedRoute>
            } />
            
            {/* Add a catch-all redirect for auth paths */}
            <Route path="/logout" element={<Navigate to="/" replace />} />
            
            {/* Redirect /auth to login */}
            <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
