
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout";

export default function CampaignsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/campaigns/manage');
  }, [navigate]);

  return (
    <Layout>
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <p>Redirecting to campaign manager...</p>
      </div>
    </Layout>
  );
}
