
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export function IsoApplicationsWidget() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["iso-applications-widget", user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0, recentLead: null };
      const { count, error } = await supabase
        .from("iso_applications")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id);
      if (error) return { count: 0, recentLead: null };
      // Get most recent for display
      const { data: recent, error: err2 } = await supabase
        .from("iso_applications")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return { count: count || 0, recentLead: recent?.lead_name || null };
    },
  });

  return (
    <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Your ISO Applications</CardTitle>
        <ArrowUpRight className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {isLoading ? "..." : data?.count || 0}
        </div>
        <div className="text-xs text-muted-foreground">
          {isLoading
            ? null
            : data?.recentLead
              ? `Most recent: ${data.recentLead}`
              : "No applications submitted yet."}
        </div>
        <Link to="/iso-applications">
          <Button size="sm" variant="outline" className="mt-3">
            View All ISO Applications
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
