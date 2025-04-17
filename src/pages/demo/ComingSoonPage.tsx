
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout";

export default function ComingSoonPage() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
        <p className="text-muted-foreground text-lg mb-4">
          This feature is coming soon in the full CRM version.
        </p>
        <p className="text-sm text-muted-foreground max-w-md mb-8">
          Create an account or sign in to access all the powerful features Reachlytix has to offer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Demo
          </Button>
          <Button onClick={() => window.location.href = "/auth/login"}>
            Create Account
          </Button>
        </div>
      </div>
    </Layout>
  );
}
