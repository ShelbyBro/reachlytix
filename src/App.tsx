
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Login"; // Using the Login component for now since it has tabs
import Dashboard from "./pages/dashboard/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminApplications from "./pages/admin/applications/AdminApplications";
import Campaigns from "./pages/campaigns/Campaigns";
import CreateCampaign from "./pages/campaigns/CreateCampaign";
import Settings from "./pages/settings/Settings";
import Upload from "./pages/upload/Upload";
import AddLead from "./pages/leads/AddLead";
import Analytics from "./pages/analytics/Analytics";
import AIAgents from "./pages/ai-agents/AIAgents";
import LeadGenerator from "./pages/lead-generator/LeadGenerator";
import NotFound from "./pages/NotFound";
import VoipPanel from "./pages/voip/VoipPanel";

// Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaigns",
    element: (
      <ProtectedRoute>
        <Campaigns />
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaigns/create",
    element: (
      <ProtectedRoute>
        <CreateCampaign />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/upload",
    element: (
      <ProtectedRoute>
        <Upload />
      </ProtectedRoute>
    ),
  },
  {
    path: "/leads/add",
    element: (
      <ProtectedRoute>
        <AddLead />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-dashboard",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/applications",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <AdminApplications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ai-agents",
    element: (
      <ProtectedRoute>
        <AIAgents />
      </ProtectedRoute>
    ),
  },
  {
    path: "/lead-generator",
    element: (
      <ProtectedRoute>
        <LeadGenerator />
      </ProtectedRoute>
    ),
  },
  {
    path: "/voip-panel",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <VoipPanel />
      </ProtectedRoute>
    ),
  },
  // 404 route - must be last
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
