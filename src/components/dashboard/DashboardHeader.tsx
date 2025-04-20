
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

type DashboardHeaderProps = {
  greeting: string;
  role: string | null;
};

export function DashboardHeader({ greeting, role }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {greeting}{" "}
          {role && (
            <span className="inline-flex items-center ml-2 px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
              <Shield size={12} className="mr-1" />
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-4">
        <Button variant="outline">Export</Button>
        <Button>New Campaign</Button>
      </div>
    </div>
  );
}
