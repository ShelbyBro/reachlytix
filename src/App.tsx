import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";
import AddLead from "./pages/AddLead";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import AIAgents from "./pages/AIAgents";
import LeadGenerator from "./pages/LeadGenerator";
import CreateCampaign from "./pages/CreateCampaign";
import IsoDashboard from "./pages/iso/IsoDashboard";
import IsoNetwork from "./pages/iso/IsoNetwork";
import IsoAgents from "./pages/iso/IsoAgents";
import IsoLeads from "./pages/iso/IsoLeads";
import IsoAnalytics from "./pages/iso/IsoAnalytics";
import IsoMerchants from "./pages/iso/merchants/IsoMerchants";
import IsoLenders from "./pages/iso/lenders/IsoLenders";
import IsoApplications from "./pages/iso/applications/IsoApplications";

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
      <ProtectedRoute>
        <AdminDashboard />
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
    path: "/iso-dashboard",
    element: (
      <ProtectedRoute>
        <IsoDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/iso-network",
    element: (
      <ProtectedRoute>
        <IsoNetwork />
      </ProtectedRoute>
    ),
  },
  {
    path: "/iso-agents",
    element: (
      <ProtectedRoute>
        <IsoAgents />
      </ProtectedRoute>
    ),
  },
  {
    path: "/iso-leads",
    element: (
      <ProtectedRoute>
        <IsoLeads />
      </ProtectedRoute>
    ),
  },
  {
    path: "/iso-analytics",
    element: (
      <ProtectedRoute>
        <IsoAnalytics />
      </ProtectedRoute>
    ),
  },
  {
    path: "/iso-merchants",
    element: (
      <ProtectedRoute>
        <IsoMerchants />
      </ProtectedRoute>
    ),
  },
  {
    path: "/iso-lenders",
    element: (
      <ProtectedRoute>
        <IsoLenders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/iso-applications",
    element: (
      <ProtectedRoute>
        <IsoApplications />
      </ProtectedRoute>
    ),
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
