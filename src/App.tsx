
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Login"; // Using the Login component for now since it has tabs
import Dashboard from "./pages/dashboard/Dashboard";
import IsoDashboard from "./pages/iso/IsoDashboard";
import IsoMerchants from "./pages/iso/merchants/IsoMerchants";
import IsoLenders from "./pages/iso/lenders/IsoLenders";
import IsoApplications from "./pages/iso/applications/IsoApplications";
import AdminApplications from "./pages/admin/applications/AdminApplications";

// Create placeholders for missing pages to fix import errors
const Campaigns = () => <Layout><div className="p-6">Campaigns Page</div></Layout>;
const Settings = () => <Layout><div className="p-6">Settings Page</div></Layout>;
const Upload = () => <Layout><div className="p-6">Upload Page</div></Layout>;
const AddLead = () => <Layout><div className="p-6">Add Lead Page</div></Layout>;
const Analytics = () => <Layout><div className="p-6">Analytics Page</div></Layout>;
const AdminDashboard = () => <Layout><div className="p-6">Admin Dashboard</div></Layout>;
const AIAgents = () => <Layout><div className="p-6">AI Agents Page</div></Layout>;
const LeadGenerator = () => <Layout><div className="p-6">Lead Generator Page</div></Layout>;
const CreateCampaign = () => <Layout><div className="p-6">Create Campaign Page</div></Layout>;
const IsoNetwork = () => <Layout><div className="p-6">ISO Network Page</div></Layout>;
const IsoAgents = () => <Layout><div className="p-6">ISO Agents Page</div></Layout>;
const IsoLeads = () => <Layout><div className="p-6">ISO Leads Page</div></Layout>;
const IsoAnalytics = () => <Layout><div className="p-6">ISO Analytics Page</div></Layout>;

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
      <ProtectedRoute>
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
