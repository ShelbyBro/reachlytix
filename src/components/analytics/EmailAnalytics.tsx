
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
} from "@/components/analytics/ChartComponents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmailAnalytics, EmailAnalyticsFilters } from "@/hooks/use-email-analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, RefreshCw, Mail, MailCheck, MailX, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export function EmailAnalytics() {
  const { role } = useAuth();
  const {
    emailAnalytics,
    isLoading,
    filters,
    setFilters,
    availableCampaigns,
    availableClients,
    refreshData
  } = useEmailAnalytics();

  // State for date range picker display
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const updateDateFilter = (dateType: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;

    setFilters(prev => ({
      ...prev,
      [dateType === 'start' ? 'startDate' : 'endDate']: date
    }));

    // Close the appropriate popover
    if (dateType === 'start') {
      setIsStartDateOpen(false);
    } else {
      setIsEndDateOpen(false);
    }
  };

  // Format for display
  const successRateFormatted = `${Math.round(emailAnalytics.successRate * 100)}%`;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Email Analytics</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refreshData()} 
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {role && (
            <Badge variant="outline" className="text-sm">
              {role === "admin" ? "Admin View" : "Client View"}
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-muted/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Date Range - Start */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Start Date</label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(filters.startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => updateDateFilter('start', date)}
                    initialFocus
                    disabled={(date) => date > new Date() || date > filters.endDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Range - End */}
            <div className="space-y-1">
              <label className="text-sm font-medium">End Date</label>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(filters.endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => updateDateFilter('end', date)}
                    initialFocus
                    disabled={(date) => 
                      date > new Date() || date < filters.startDate
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Campaign Filter */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Campaign</label>
              <Select
                value={filters.campaignId || ""}
                onValueChange={(value) => setFilters({...filters, campaignId: value || null})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Campaigns</SelectItem>
                  {availableCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Filter (Admin Only) */}
            {role === "admin" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Client</label>
                <Select
                  value={filters.clientId || ""}
                  onValueChange={(value) => setFilters({...filters, clientId: value || null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Clients</SelectItem>
                    {availableClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Emails */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : emailAnalytics.totalEmails.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              For selected time period
            </p>
          </CardContent>
        </Card>

        {/* Delivery Success Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <MailCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : successRateFormatted}
            </div>
            <p className="text-xs text-muted-foreground">
              Delivery success rate
            </p>
          </CardContent>
        </Card>

        {/* Failed Emails */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Emails</CardTitle>
            <MailX className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : emailAnalytics.failedEmails.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Emails that failed to deliver
            </p>
          </CardContent>
        </Card>

        {/* Top Campaign */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Campaign</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {isLoading ? "..." : emailAnalytics.topCampaign?.title || "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {emailAnalytics.topCampaign
                ? `${emailAnalytics.topCampaign.count.toLocaleString()} emails sent`
                : "No campaign data available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 w-full sm:w-auto">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="status">Delivery Status</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emails Over Time</CardTitle>
              <CardDescription>
                Email volume by delivery date
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <AreaChartComponent 
                  data={emailAnalytics.emailsOverTime.map(item => ({
                    name: item.date,
                    value: item.count,
                    status: item.status
                  }))} 
                  height={300}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
              <CardDescription>
                Successful vs failed delivery ratio
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <PieChartComponent 
                  data={emailAnalytics.emailsByStatus} 
                  height={300}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emails by Campaign</CardTitle>
              <CardDescription>
                Distribution of emails across campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <BarChartComponent 
                  data={emailAnalytics.emailsByCampaign} 
                  height={300}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
