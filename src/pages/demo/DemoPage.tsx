
import { ArrowUpRight, TrendingUp, Users, Activity, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AreaChart, BarChart } from "@/components/ui/chart";
import Layout from "@/components/layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NewCampaignDialog } from "@/components/demo/NewCampaignDialog";
import { DemoFeatureTooltip } from "@/components/demo/DemoFeatureTooltip";
import { useNavigate } from "react-router-dom";

const areaChartData = [
  { name: "Jan", value: 30 },
  { name: "Feb", value: 40 },
  { name: "Mar", value: 45 },
  { name: "Apr", value: 35 },
  { name: "May", value: 55 },
  { name: "Jun", value: 60 },
  { name: "Jul", value: 65 },
];

const barChartData = [
  { name: "Email", value: 400 },
  { name: "Social", value: 300 },
  { name: "Direct", value: 300 },
  { name: "Organic", value: 200 },
];

export default function DemoPage() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <Alert className="bg-amber-100 border-amber-300 mb-6">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-800 font-medium ml-2">
          This is a public demo of Reachlytix. Features are limited and no data will be saved.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Demo</h1>
          <p className="text-muted-foreground">
            Welcome to the Reachlytix dashboard demo
          </p>
        </div>
        <div className="flex gap-3">
          <DemoFeatureTooltip>
            <Button variant="outline">Export</Button>
          </DemoFeatureTooltip>
          <Button onClick={() => window.location.href = "/auth/login"}>Create Account</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            <Progress value={78} className="h-1 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.4%</div>
            <p className="text-xs text-green-500 flex items-center">
              +0.8% <ArrowUpRight className="h-3 w-3 ml-1" />
            </p>
            <Progress value={34} className="h-1 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">4 ending this month</p>
            <Progress value={65} className="h-1 mt-3" />
            <div className="mt-4">
              <NewCampaignDialog />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.6%</div>
            <p className="text-xs text-muted-foreground">1.2% higher than average</p>
            <Progress value={85} className="h-1 mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Overview of campaign metrics over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <AreaChart
              data={areaChartData}
              index="name"
              categories={["value"]}
              colors={["#9b87f5"]}
              valueFormatter={(value) => `${value}%`}
              className="h-[300px] mt-1"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Breakdown of lead acquisition channels</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={barChartData}
              index="name"
              categories={["value"]}
              colors={["#9b87f5"]}
              valueFormatter={(value) => `${value} leads`}
              className="h-[250px] mt-4"
            />
          </CardContent>
        </Card>
      </div>

      {/* Demo Feature Buttons - updated section */}
      <div className="mt-6 flex flex-wrap gap-3">
        <DemoFeatureTooltip>
          <Button
            variant="outline"
            onClick={() => navigate("/demo/coming-soon")}
          >
            Analytics
          </Button>
        </DemoFeatureTooltip>
        
        <DemoFeatureTooltip>
          <Button
            variant="outline"
            onClick={() => navigate("/demo/coming-soon")}
          >
            Settings
          </Button>
        </DemoFeatureTooltip>
        
        <DemoFeatureTooltip>
          <Button
            variant="outline"
          >
            Reports
          </Button>
        </DemoFeatureTooltip>
        
        <DemoFeatureTooltip>
          <Button
            variant="outline"
          >
            Integrations
          </Button>
        </DemoFeatureTooltip>
      </div>

      <div className="mt-8 text-center">
        <p className="mb-4 text-muted-foreground">Want to access the full dashboard and all features?</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => window.location.href = "/auth/login"}>
            Create an Account
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Return to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}
