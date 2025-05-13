
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout";
import { Loader2, Search, Save, Download } from "lucide-react";
import { useState } from "react";
import { useSmartScrape, Lead } from "@/hooks/use-smart-scrape";
import { toast } from "sonner";

export default function LeadGenerator() {
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
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Lead Generator</h1>
          <p className="text-muted-foreground">Generate new leads based on keywords and locations</p>
        </div>
        
        <Tabs defaultValue="scrape" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scrape">Smart Scrape</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="import">Import Leads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scrape">
            <Card>
              <CardHeader>
                <CardTitle>Smart Lead Generator</CardTitle>
                <CardDescription>Generate new leads based on business type and location</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={generateLeads} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyword">Business Type / Keyword</Label>
                      <Input
                        id="keyword"
                        placeholder="e.g. Restaurants, Dentists, Auto Shops"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g. New York, NY or 90210"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="limit">Number of Results</Label>
                      <Select 
                        value={String(limit)} 
                        onValueChange={(value) => setLimit(Number(value))}
                      >
                        <SelectTrigger id="limit">
                          <SelectValue placeholder="Select limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Results</SelectItem>
                          <SelectItem value="10">10 Results</SelectItem>
                          <SelectItem value="25">25 Results</SelectItem>
                          <SelectItem value="50">50 Results</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Generate Leads
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {leads.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Generated Leads</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveAllLeads}
                      disabled={isSavingAll}
                    >
                      {isSavingAll ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving All...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save All Leads
                        </>
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    {leads.length} leads found for "{keyword}" in {location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Phone</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Source</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {leads.map((lead, index) => (
                            <tr key={index} className="hover:bg-muted/30">
                              <td className="px-4 py-2 text-sm">{lead.name || "N/A"}</td>
                              <td className="px-4 py-2 text-sm">{lead.email || "N/A"}</td>
                              <td className="px-4 py-2 text-sm">{lead.phone || "N/A"}</td>
                              <td className="px-4 py-2 text-sm text-muted-foreground">
                                {lead.source || "Smart Scrape"}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => saveLead(lead, index)}
                                  disabled={savingIndices.includes(index)}
                                >
                                  {savingIndices.includes(index) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t py-3 bg-muted/20">
                  <div className="flex justify-between w-full items-center text-sm text-muted-foreground">
                    <span>Save leads to your database to work with them</span>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" /> Export to CSV
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Add Lead Manually</CardTitle>
                <CardDescription>Enter lead information directly</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Enter name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter email" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="Enter phone number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Source</Label>
                      <Input id="source" placeholder="Lead source" />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t py-4">
                <Button>Add Lead</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import Leads</CardTitle>
                <CardDescription>Upload a CSV file with lead data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                    <Download className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground pb-2">
                      Drag and drop your CSV file here, or click to select
                    </p>
                    <Button size="sm" variant="outline">
                      Select CSV File
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t py-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Make sure your CSV has name, email, phone, and source columns</span>
                <a href="#" className="text-primary underline">
                  Download Template
                </a>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
