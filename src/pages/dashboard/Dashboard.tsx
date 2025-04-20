
// ✅ Full Refined Dashboard Page (client-login wrapped section)
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  MoreHorizontal,
  Shield,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AreaChart, BarChart, PieChart } from "@/components/ui/chart";
import Layout from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Mock chart data
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

const pieChartData = [
  { name: "Active", value: 540, color: "#9b87f5" },
  { name: "Pending", value: 260, color: "#D6BCFA" },
  { name: "Inactive", value: 170, color: "#D3E4FD" },
];

export default function Dashboard() {
  const { profile, role } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    setGreeting(`${greeting}, ${profile?.first_name || 'there'}!`);
  }, [profile]);

  return (
    <Layout>
      {/* 👇 Section ID added for scroll-to behavior */}
      <section id="client-login">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {greeting} {role && <span className="inline-flex items-center ml-2 px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary"><Shield size={12} className="mr-1" /> {role.charAt(0).toUpperCase() + role.slice(1)}</span>}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">Export</Button>
            <Button>New Campaign</Button>
          </div>
        </div>

        {role === "admin" && (
          <div className="bg-primary/10 rounded-lg p-4 mb-6">
            <h2 className="font-medium flex items-center">
              <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              You have administrator privileges. You can manage all clients, campaigns, and users.
            </p>
          </div>
        )}

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

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {/* AI Agent Zone Card - Fixed to use Link properly with the Card */}
          <Link to="/ai-agents" className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
            <Card>
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">AI Agent Zone</CardTitle>
                  <Bot className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 text-sm text-muted-foreground">
                  Create and manage AI phone agents to handle calls and generate leads.
                </div>
                <div className="mt-4 text-xs flex items-center text-primary">
                  View AI agents <ArrowUpRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Overview of campaign metrics over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <AreaChart
                data={areaChartData}
                width={800}
                height={300}
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
                width={400}
                height={250}
                index="name"
                categories={["value"]}
                colors={["#9b87f5"]}
                valueFormatter={(value) => `${value} leads`}
                className="h-[250px] mt-4 -ml-2"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Lead Status</CardTitle>
              <CardDescription>Distribution by status</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                data={pieChartData}
                width={300}
                height={200}
                index="name"
                categories={["value"]}
                colors={pieChartData.map((item) => item.color)}
                valueFormatter={(value) => `${value} leads`}
                className="h-[200px] w-full"
              />
            </CardContent>
            <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#9b87f5] mr-2"></div>
                Active (58%)
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#D6BCFA] mr-2"></div>
                Pending (28%)
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#D3E4FD] mr-2"></div>
                Inactive (14%)
              </div>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Latest campaign performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                  <div className="space-y-2">
                    {[{ name: "Q2 Newsletter", leads: "2,420", conversion: "3.8%", status: "Active" },
                      { name: "Summer Promo", leads: "1,865", conversion: "4.2%", status: "Active" },
                      { name: "Product Launch", leads: "3,647", conversion: "5.1%", status: "Active" },
                    ].map((campaign) => (
                      <div key={campaign.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {campaign.leads} leads • {campaign.conversion} conversion
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs bg-primary/20 text-primary py-1 px-2 rounded-full mr-2">
                            {campaign.status}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="scheduled">
                  <div className="space-y-2">
                    {[{ name: "Fall Collection", date: "Sep 15", leads: "Target: 5,000", status: "Scheduled" },
                      { name: "Holiday Special", date: "Nov 20", leads: "Target: 8,500", status: "Scheduled" },
                    ].map((campaign) => (
                      <div key={campaign.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Starts {campaign.date} • {campaign.leads}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs bg-secondary/70 text-secondary-foreground py-1 px-2 rounded-full mr-2">
                            {campaign.status}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed">
                  <div className="space-y-2">
                    {[{ name: "Q1 Newsletter", leads: "2,145", conversion: "3.5%", status: "Completed" },
                      { name: "Spring Sale", leads: "3,274", conversion: "4.7%", status: "Completed" },
                      { name: "Webinar Series", leads: "1,532", conversion: "2.9%", status: "Completed" },
                    ].map((campaign) => (
                      <div key={campaign.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {campaign.leads} leads • {campaign.conversion} conversion
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs bg-muted text-muted-foreground py-1 px-2 rounded-full mr-2">
                            {campaign.status}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
