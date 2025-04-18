
import React from "react";
import Layout from "@/components/layout";
import { LeadGeneratorPanel } from "@/components/leads/lead-generator-panel";
import { NeuralBackground } from "@/components/neural-background";

export default function LeadGeneratorPage() {
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
                Upload and validate your leads
              </p>
            </div>
          </div>

          <LeadGeneratorPanel />
        </div>
      </div>
    </Layout>
  );
}
