
import React from "react";
import Layout from "@/components/layout";
import { LeadGeneratorPanel } from "@/components/leads/lead-generator-panel";
import { NeuralBackground } from "@/components/neural-background";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadGeneratorForm } from "@/components/lead-generator/LeadGeneratorForm";
import { LeadsTable } from "@/components/lead-generator/LeadsTable";
import { LoadingState } from "@/components/lead-generator/LoadingState";
import { useSmartScrape } from "@/hooks/use-smart-scrape";

export default function LeadGeneratorPage() {
  const {
    keyword,
    setKeyword,
    location,
    setLocation,
    limit,
    setLimit,
    isLoading,
    leads,
    savingIndices,
    isSavingAll,
    generateLeads,
    saveLead,
    saveAllLeads
  } = useSmartScrape();

  return (
    <Layout>
      <div className="relative">
        <NeuralBackground />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Lead Generator
              </h1>
              <p className="text-muted-foreground">
                Upload, add and manage your leads
              </p>
            </div>
          </div>

          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upload">Upload CSV / Manual Entry</TabsTrigger>
              <TabsTrigger value="smart-scrape">Smart Scrape</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <LeadGeneratorPanel />
            </TabsContent>

            <TabsContent value="smart-scrape">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Lead Generation Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeadGeneratorForm 
                    keyword={keyword}
                    setKeyword={setKeyword}
                    location={location}
                    setLocation={setLocation}
                    limit={limit}
                    setLimit={setLimit}
                    isLoading={isLoading}
                    leads={leads}
                    isSavingAll={isSavingAll}
                    onGenerateLeads={generateLeads}
                    onSaveAllLeads={saveAllLeads}
                  />
                </CardContent>
              </Card>

              {leads.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LeadsTable 
                      leads={leads}
                      savingIndices={savingIndices}
                      onSaveLead={saveLead}
                    />
                  </CardContent>
                </Card>
              )}
              
              <LoadingState
                isLoading={isLoading && leads.length === 0}
                hasKeyword={!!keyword}
                hasLocation={!!location}
                noResults={!isLoading && leads.length === 0 && !!keyword && !!location}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
