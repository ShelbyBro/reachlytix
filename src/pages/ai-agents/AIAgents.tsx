
import React, { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AIAgents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock data for agents
  const agents = [
    { id: 1, name: "Sales Assistent", status: "active", callsMade: 128, successRate: "18%" },
    { id: 2, name: "Lead Qualifier", status: "active", callsMade: 256, successRate: "22%" },
    { id: 3, name: "Follow-up Specialist", status: "inactive", callsMade: 68, successRate: "15%" },
    { id: 4, name: "Appointment Setter", status: "active", callsMade: 192, successRate: "24%" },
  ];
  
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
            <p className="text-muted-foreground">
              Manage and deploy AI voice agents for your campaigns
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New AI Agent</DialogTitle>
                  <DialogDescription>
                    Configure your new AI voice agent for outbound calls
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Agent Name</Label>
                    <Input placeholder="e.g. Sales Assistant" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Voice Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male-professional">Male - Professional</SelectItem>
                        <SelectItem value="female-professional">Female - Professional</SelectItem>
                        <SelectItem value="male-friendly">Male - Friendly</SelectItem>
                        <SelectItem value="female-friendly">Female - Friendly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Industry/Business Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="financial">Financial Services</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Greeting Script</Label>
                    <Textarea 
                      placeholder="Hello, this is [Agent Name] calling from [Company]. How are you today?" 
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Create Agent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Your AI Agents</CardTitle>
                <CardDescription>
                  Configure and manage your AI voice agents
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search agents..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Agents</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              
              <div className="rounded-md border">
                <div className="grid grid-cols-5 py-3 px-4 font-medium border-b">
                  <div>Name</div>
                  <div>Status</div>
                  <div>Calls Made</div>
                  <div>Success Rate</div>
                  <div>Actions</div>
                </div>
                
                {agents.map((agent) => (
                  <div key={agent.id} className="grid grid-cols-5 py-3 px-4 border-b items-center">
                    <div>{agent.name}</div>
                    <div>
                      {agent.status === "active" ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div>{agent.callsMade}</div>
                    <div>{agent.successRate}</div>
                    <div className="space-x-1">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Logs</Button>
                    </div>
                  </div>
                ))}
                
                {agents.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No agents found. Create your first AI agent to get started.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>
              View and compare the performance of your AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/30">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Performance metrics will be displayed here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
