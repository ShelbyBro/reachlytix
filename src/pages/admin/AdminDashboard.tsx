
import { useState } from "react";
import {
  Users,
  DollarSign,
  BarChart3,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AreaChart, BarChart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout";

const areaChartData = [
  { date: "Jan", users: 200, revenue: 1900, campaigns: 5 },
  { date: "Feb", users: 250, revenue: 2300, campaigns: 6 },
  { date: "Mar", users: 280, revenue: 2600, campaigns: 7 },
  { date: "Apr", users: 300, revenue: 2750, campaigns: 8 },
  { date: "May", users: 350, revenue: 3100, campaigns: 9 },
  { date: "Jun", users: 375, revenue: 3500, campaigns: 10 },
  { date: "Jul", users: 410, revenue: 3800, campaigns: 11 },
];

const barChartData = [
  { name: "Enterprise", value: 45000 },
  { name: "SMB", value: 32000 },
  { name: "Startup", value: 18000 },
  { name: "Individual", value: 9000 },
];

export default function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  
  return (
    <Layout isAdmin={true}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System overview and management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
              <Shield size={16} />
              Admin Actions
            </Button>
            <Button className="gap-2">
              <Users size={16} />
              Manage Users
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-card to-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$48.2K</div>
              <p className="text-xs text-muted-foreground">
                +8.4% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">352</div>
              <p className="text-xs text-muted-foreground">
                +12 in last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">
                -15min from last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Growth Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <AreaChart
                  data={areaChartData}
                  index="date"
                  categories={["users", "revenue", "campaigns"]}
                  colors={["#9b87f5", "#6E59A5", "#D3E4FD"]}
                  valueFormatter={(value) => `${value}`}
                  showLegend
                  showGridLines
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Customer Segment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <BarChart
                  data={barChartData}
                  index="name"
                  categories={["value"]}
                  colors={["#9b87f5"]}
                  valueFormatter={(value) => `$${value}`}
                  showLegend={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent User Activity</CardTitle>
              <div className="relative w-60">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Campaigns</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 1, name: "Michael Scott", email: "michael@example.com", status: "Active", campaigns: 8, lastActivity: "2 hours ago" },
                      { id: 2, name: "Jim Halpert", email: "jim@example.com", status: "Active", campaigns: 5, lastActivity: "1 day ago" },
                      { id: 3, name: "Pam Beesly", email: "pam@example.com", status: "Pending", campaigns: 2, lastActivity: "3 days ago" },
                      { id: 4, name: "Dwight Schrute", email: "dwight@example.com", status: "Flagged", campaigns: 12, lastActivity: "5 hours ago" },
                      { id: 5, name: "Angela Martin", email: "angela@example.com", status: "Active", campaigns: 4, lastActivity: "Just now" },
                    ].map((user) => (
                      <TableRow key={user.id} className={selectedUser === user.id ? "bg-muted" : ""}>
                        <TableCell className="font-medium">
                          <div>
                            {user.name}
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === "Active" ? "default" : 
                              user.status === "Pending" ? "outline" : 
                              "destructive"
                            }
                            className="flex w-fit items-center gap-1"
                          >
                            {user.status === "Active" && <CheckCircle2 size={12} />}
                            {user.status === "Pending" && <Clock size={12} />}
                            {user.status === "Flagged" && <AlertCircle size={12} />}
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.campaigns}</TableCell>
                        <TableCell>{user.lastActivity}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="active">
                <div className="text-center py-20">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                  <h3 className="text-lg font-medium">Tab content for Active Users</h3>
                  <p className="text-muted-foreground">
                    View and manage all active users in the system
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="pending">
                <div className="text-center py-20">
                  <Clock className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                  <h3 className="text-lg font-medium">Tab content for Pending Users</h3>
                  <p className="text-muted-foreground">
                    Approve or reject pending user registrations
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="flagged">
                <div className="text-center py-20">
                  <AlertCircle className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                  <h3 className="text-lg font-medium">Tab content for Flagged Users</h3>
                  <p className="text-muted-foreground">
                    Review and manage flagged user accounts
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
