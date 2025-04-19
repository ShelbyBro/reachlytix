
import React from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailAnalytics } from "@/components/analytics/EmailAnalytics";
import CampaignAnalytics from "./campaign-analytics";

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Analytics</h1>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="campaigns">Campaign Analytics</TabsTrigger>
            <TabsTrigger value="email">Email Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <CampaignAnalytics />
          </TabsContent>

          <TabsContent value="email">
            <EmailAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
