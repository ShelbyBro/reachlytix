
import React, { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IsoLeadsTable } from "@/components/iso/IsoLeadsTable";
import { NeuralBackground } from "@/components/neural-background";
import { useIsoLeads } from "@/hooks/use-iso-leads";

export default function IsoDashboard() {
  const [activeTab, setActiveTab] = useState("assigned");
  const { leads, isLoading, updateLeadStatus, addLeadNote } = useIsoLeads();

  return (
    <Layout>
      <div className="relative">
        <NeuralBackground />
        <div className="relative z-10 container mx-auto py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              ISO Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your assigned leads and track their status</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="assigned">Assigned Leads</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="assigned">
                  <IsoLeadsTable 
                    leads={leads.filter(lead => lead.status === "assigned")} 
                    isLoading={isLoading}
                    onStatusChange={updateLeadStatus}
                    onNoteAdd={addLeadNote}
                    view="assigned"
                  />
                </TabsContent>
                <TabsContent value="in-progress">
                  <IsoLeadsTable 
                    leads={leads.filter(lead => ["pending", "under_review"].includes(lead.status))} 
                    isLoading={isLoading}
                    onStatusChange={updateLeadStatus}
                    onNoteAdd={addLeadNote}
                    view="in-progress"
                  />
                </TabsContent>
                <TabsContent value="completed">
                  <IsoLeadsTable 
                    leads={leads.filter(lead => ["approved", "declined"].includes(lead.status))} 
                    isLoading={isLoading}
                    onStatusChange={updateLeadStatus}
                    onNoteAdd={addLeadNote}
                    view="completed"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
