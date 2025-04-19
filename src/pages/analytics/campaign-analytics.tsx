
import React, { useState, useMemo } from "react";
import Layout from "@/components/layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, AreaChart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, 
  RefreshCw, 
  Mail, 
  MessageSquare, 
  BarChart as BarChartIcon,
  ArrowUp,
  Send,
  ArrowDown
} from "lucide-react";
import { generateMockAnalytics } from "@/utils/campaign-utils";
import { cn } from "@/lib/utils";

export default function CampaignAnalytics() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState<string>("all");
  
  const analytics = useMemo(() => {
    // Generate mock analytics data
    const emailData = generateMockAnalytics(dateRange.from, dateRange.to, 'email');
    const smsData = generateMockAnalytics(dateRange.from, dateRange.to, 'sms');
    const whatsappData = generateMockAnalytics(dateRange.from, dateRange.to, 'whatsapp');
    
    // Combine data or filter based on message type
    if (messageType === 'email') {
      return emailData;
    } else if (messageType === 'sms') {
      return smsData;
    } else if (messageType === 'whatsapp') {
      return whatsappData;
    } else {
      // Combine all data
      return {
        overTime: [...emailData.overTime, ...smsData.overTime, ...whatsappData.overTime]
          .sort((a, b) => a.date.localeCompare(b.date)),
        totals: {
          sent: emailData.totals.sent + smsData.totals.sent + whatsappData.totals.sent,
          delivered: emailData.totals.delivered + smsData.totals.delivered + whatsappData.totals.delivered,
          failed: emailData.totals.failed + smsData.totals.failed + whatsappData.totals.failed,
          opened: emailData.totals.opened + smsData.totals.opened + whatsappData.totals.opened,
          clicked: emailData.totals.clicked + smsData.totals.clicked + whatsappData.totals.clicked,
          openRate: (emailData.totals.opened + smsData.totals.opened + whatsappData.totals.opened) / 
                   (emailData.totals.delivered + smsData.totals.delivered + whatsappData.totals.delivered),
          clickRate: (emailData.totals.clicked + smsData.totals.clicked + whatsappData.totals.clicked) / 
                    (emailData.totals.delivered + smsData.totals.delivered + whatsappData.totals.delivered),
          conversionRate: (emailData.totals.clicked + smsData.totals.clicked + whatsappData.totals.clicked) * 0.15 / 
                         (emailData.totals.delivered + smsData.totals.delivered + whatsappData.totals.delivered),
        }
      };
    }
  }, [dateRange, messageType]);
  
  const refreshData = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  const chartData = useMemo(() => {
    if (!analytics || !analytics.overTime) return [];
    
    // Transform data for charts
    return analytics.overTime.map(item => ({
      name: item.date,
      Sent: item.sent,
      Delivered: item.delivered,
      Opened: item.opened,
      Clicked: item.clicked,
      type: item.type
    }));
  }, [analytics]);
  
  const pieData = useMemo(() => {
    if (!analytics || !analytics.totals) return [];
    
    return [
      { name: 'Delivered', value: analytics.totals.delivered, color: '#4ade80' },
      { name: 'Failed', value: analytics.totals.failed, color: '#f87171' }
    ];
  }, [analytics]);
  
  const conversionData = useMemo(() => {
    if (!analytics || !analytics.totals) return [];
    
    const { delivered, opened, clicked } = analytics.totals;
    const conversions = clicked * 0.15; // Assuming 15% conversion rate for clicked messages
    
    return [
      { name: 'Delivered', value: delivered },
      { name: 'Opened', value: opened },
      { name: 'Clicked', value: clicked },
      { name: 'Converted', value: conversions }
    ];
  }, [analytics]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Campaign Analytics
          </h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-muted/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to,
                      }}
                      onSelect={range => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to });
                        }
                      }}
                      numberOfMonths={2}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Message Type Filter */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Message Type</label>
                <Select
                  value={messageType}
                  onValueChange={setMessageType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Sent */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : analytics?.totals.sent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Messages sent in selected period
              </p>
            </CardContent>
          </Card>

          {/* Open Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <Mail className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : `${(analytics?.totals.openRate * 100).toFixed(1)}%`}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="flex items-center text-green-500 mr-2">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  2.5%
                </span>
                vs previous period
              </div>
            </CardContent>
          </Card>

          {/* Click-through Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <BarChartIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : `${(analytics?.totals.clickRate * 100).toFixed(1)}%`}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="flex items-center text-red-500 mr-2">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  0.8%
                </span>
                vs previous period
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Badge className="h-4 text-xs">PRO</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : `${(analytics?.totals.conversionRate * 100).toFixed(1)}%`}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="flex items-center text-green-500 mr-2">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  1.2%
                </span>
                Estimated conversions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 w-full sm:w-auto">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Messages Over Time</CardTitle>
                <CardDescription>
                  Campaign activity over the selected date range
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <AreaChart
                    className="h-[300px]"
                    data={chartData}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="delivery" className="space-y-4">
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
                  <PieChart 
                    className="h-[300px]"
                    data={pieData}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="conversion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>
                  From delivery to conversion
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <BarChart
                    className="h-[300px]"
                    data={conversionData}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Message Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Message Type Breakdown</CardTitle>
            <CardDescription>Distribution of messages by type</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center p-4 border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mr-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="text-2xl font-bold">{(analytics?.totals.sent * 0.6).toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">60% of total</div>
              </div>
            </div>
            
            <div className="flex items-center p-4 border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mr-4">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">SMS</div>
                <div className="text-2xl font-bold">{(analytics?.totals.sent * 0.25).toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">25% of total</div>
              </div>
            </div>
            
            <div className="flex items-center p-4 border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mr-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">WhatsApp</div>
                <div className="text-2xl font-bold">{(analytics?.totals.sent * 0.15).toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">15% of total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
