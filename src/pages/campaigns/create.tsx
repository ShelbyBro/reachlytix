
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout";
import { CreateCampaignForm } from "@/components/campaigns/CreateCampaignForm"; 

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  
  const handleCampaignCreated = () => {
    navigate("/campaigns");
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-muted-foreground">
            Create a new campaign to send to your leads and customers
          </p>
        </div>

        <CreateCampaignForm onCampaignCreated={handleCampaignCreated} />
      </div>
    </Layout>
  );
}
