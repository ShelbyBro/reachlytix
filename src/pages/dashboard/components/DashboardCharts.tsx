
import { Suspense } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AreaChart, BarChart, PieChart } from "@/components/ui/chart";
import { areaChartData, barChartData, pieChartData } from "./ChartData";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";

export function DashboardCharts() {
  return (
    <DashboardErrorBoundary fallback={<LoadingState className="mb-6" />}>
      <Suspense fallback={<LoadingState className="mb-6" />}>
        <div>
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
                  valueFormatter={(value: number) => `${value}%`}
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
                  valueFormatter={(value: number) => `${value} leads`}
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
                  valueFormatter={(value: number) => `${value} leads`}
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
          </div>
        </div>
      </Suspense>
    </DashboardErrorBoundary>
  );
}
