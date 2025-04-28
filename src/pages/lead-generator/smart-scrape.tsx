
import React, { useState } from "react";
import Layout from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoaderIcon, Save, Search, SaveAll } from "lucide-react";
import { NeuralBackground } from "@/components/neural-background";

interface Lead {
  name: string;
  phone: string;
  email: string;
  website: string;
  source: string;
  address?: string;
  company?: string;
}

export default function SmartScrapePage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [savingIndices, setSavingIndices] = useState<number[]>([]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerateLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim() || !location.trim()) {
      toast({
        title: "Missing fields",
        description: "Keyword and location are required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setLeads([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('smart-scrape', {
        body: { keyword, location, limit },
      });

      if (error) throw error;

      if (data?.status === 'success' && Array.isArray(data.leads)) {
        setLeads(data.leads);
        
        if (data.leads.length === 0) {
          toast({
            title: "No Leads Found",
            description: "Try a different keyword or location.",
          });
        } else {
          toast({
            title: "Leads Generated",
            description: `Successfully generated ${data.leads.length} leads.`,
          });
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating leads:', error);
      toast({
        title: "Error",
        description: "Failed to generate leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLead = async (lead: Lead, index: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save leads.",
        variant: "destructive",
      });
      return;
    }

    setSavingIndices(prev => [...prev, index]);

    try {
      const { error } = await supabase.from("cleaned_leads").insert([{
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        source: `${lead.source} (${lead.address || 'No address'})`,
        client_id: user.id,
        status: "valid"
      }]);

      if (error) throw error;

      toast({
        title: "Lead Saved",
        description: `Successfully saved ${lead.name} to your leads.`,
      });
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: "Error",
        description: "Failed to save lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingIndices(prev => prev.filter(i => i !== index));
    }
  };

  const handleSaveAllLeads = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save leads.",
        variant: "destructive",
      });
      return;
    }

    if (leads.length === 0) {
      toast({
        title: "No Leads to Save",
        description: "Generate leads first before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingAll(true);

    try {
      const leadsToInsert = leads.map(lead => ({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        source: `${lead.source} (${lead.address || 'No address'})`,
        client_id: user.id,
        status: "valid"
      }));

      const { error } = await supabase.from("cleaned_leads").insert(leadsToInsert);

      if (error) throw error;

      toast({
        title: "All Leads Saved",
        description: `Successfully saved ${leads.length} leads to your collection.`,
      });
    } catch (error) {
      console.error('Error saving all leads:', error);
      toast({
        title: "Error",
        description: "Failed to save all leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <Layout>
      <div className="relative">
        <NeuralBackground />
        <div className="relative z-10 container mx-auto py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Smart Lead Scraper
            </h1>
            <p className="text-muted-foreground">Generate potential leads by keyword and location</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Lead Generation Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateLeads} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="keyword">Keyword/Industry</Label>
                    <Input 
                      id="keyword" 
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g., Real Estate, Marketing, Software"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., New York, Chicago, San Francisco"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="limit">Number of Leads</Label>
                    <Input 
                      id="limit"
                      type="number"
                      min={1}
                      max={20}
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoaderIcon className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Generate Leads
                      </>
                    )}
                  </Button>
                  
                  {leads.length > 0 && (
                    <Button
                      type="button"
                      variant="outline" 
                      className="gap-2"
                      onClick={handleSaveAllLeads}
                      disabled={isLoading || isSavingAll || leads.length === 0}
                    >
                      {isSavingAll ? (
                        <>
                          <LoaderIcon className="h-4 w-4 animate-spin" />
                          Saving All...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save All Leads
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {leads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead, index) => (
                        <TableRow key={index}>
                          <TableCell>{lead.name}</TableCell>
                          <TableCell>{lead.phone}</TableCell>
                          <TableCell className="max-w-[180px] truncate">{lead.email}</TableCell>
                          <TableCell className="max-w-[180px] truncate">
                            {lead.website ? (
                              <a 
                                href={lead.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {lead.website}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate">
                            {lead.address || "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveLead(lead, index)}
                              disabled={savingIndices.includes(index)}
                            >
                              {savingIndices.includes(index) ? (
                                <LoaderIcon className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-1" /> Save
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          
          {isLoading && leads.length === 0 && (
            <div className="flex justify-center items-center p-12">
              <div className="text-center">
                <LoaderIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Searching for leads...</p>
              </div>
            </div>
          )}
          
          {!isLoading && leads.length === 0 && keyword && location && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-lg mb-2">No leads found</p>
                  <p className="text-muted-foreground">Try a different keyword or location</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
