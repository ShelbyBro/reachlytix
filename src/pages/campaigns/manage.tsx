import Layout from "@/components/layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManageCampaigns() {
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    try {
      // replace with actual email sending logic using Resend
      console.log("Sending campaign email:", { campaignName, subject, content });
      alert("Campaign submitted!");
    } catch (error) {
      console.error("Error sending campaign:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto mt-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Campaign Name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
            <Input
              placeholder="Email Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              rows={8}
              placeholder="Email Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={handleSubmit}>Send Campaign</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
