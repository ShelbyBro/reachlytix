
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function CampaignTabs() {
  return (
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
  );
}
