
import React from "react";
import Layout from "@/components/layout";
import { CsvUploaderComponent } from "@/components/csv-uploader"; // Corrected import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NeuralBackground } from "@/components/neural-background";

export default function UploadPage() {
  return (
    <Layout>
      <div className="relative">
        <NeuralBackground />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Upload Leads
              </h1>
              <p className="text-muted-foreground">
                Import your leads from CSV files
              </p>
            </div>
          </div>
          <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle>Upload Leads CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <CsvUploaderComponent />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
