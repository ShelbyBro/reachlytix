
import { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Bot, Phone, Search, Upload, UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  // Fetch summary statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        // Get lead count
        const { count: leadCount, error: leadError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });
          
        // Get client count
        const { count: clientCount, error: clientError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
          
        // Get campaign count
        const { count: campaignCount, error: campaignError } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true });
          
        // Get agent count
        const { count: agentCount, error: agentError } = await supabase
          .from('ai_agents')
          .select('*', { count: 'exact', head: true });
        
        return {
          leadCount: leadCount || 0,
          clientCount: clientCount || 0,
          campaignCount: campaignCount || 0,
          agentCount: agentCount || 0
        };
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
          leadCount: 0,
          clientCount: 0,
          campaignCount: 0,
          agentCount: 0
        };
      }
    }
  });

  const adminCards = [
    {
      title: "Lead Generator",
      description: "Generate new leads using keywords",
      icon: Search,
      href: "/lead-generator",
      color: "bg-purple-600"
    },
    {
      title: "Campaign Manager",
      description: "Create and manage outreach campaigns",
      icon: BarChart3,
      href: "/campaigns",
      color: "bg-blue-600"
    },
    {
      title: "AI Agents",
      description: "Manage AI assistants and assignments",
      icon: Bot,
      href: "/ai-agents",
      color: "bg-green-600"
    },
    {
      title: "VoIP Panel",
      description: "Make and manage AI-powered calls",
      icon: Phone,
      href: "/voip-panel",
      color: "bg-orange-500"
    },
    {
      title: "Upload Leads",
      description: "Import leads from CSV files",
      icon: Upload,
      href: "/upload",
      color: "bg-teal-600"
    },
    {
      title: "Add Lead",
      description: "Manually add new lead information",
      icon: UserPlus,
      href: "/leads/add",
      color: "bg-indigo-600"
    }
  ];

  return (
    <Layout isAdmin>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage leads, campaigns, and AI agents from one place
          </p>
        </div>
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.leadCount || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.clientCount || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.campaignCount || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.agentCount || 0}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Admin Tools */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminCards.map((card) => (
              <Card key={card.title} className="overflow-hidden">
                <Link to={card.href}>
                  <div className="flex flex-col h-full">
                    <div className={`${card.color} p-4`}>
                      <card.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardHeader>
                      <CardTitle>{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <Link to="/lead-generator">
                <Search className="mr-2 h-4 w-4" /> Generate Leads
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/campaigns/create">
                <BarChart3 className="mr-2 h-4 w-4" /> Create Campaign
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/ai-agents">
                <Bot className="mr-2 h-4 w-4" /> Deploy Agent
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/admin-dashboard">
                <Users className="mr-2 h-4 w-4" /> User Management
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
