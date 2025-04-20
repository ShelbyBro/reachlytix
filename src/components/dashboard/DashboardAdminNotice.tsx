
import { Shield } from "lucide-react";

type Props = {
  role: string | null;
};

export function DashboardAdminNotice({ role }: Props) {
  if (role !== "admin") return null;
  return (
    <div className="bg-primary/10 rounded-lg p-4 mb-6">
      <h2 className="font-medium flex items-center">
        <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
      </h2>
      <p className="text-sm text-muted-foreground">
        You have administrator privileges. You can manage all clients, campaigns, and users.
      </p>
    </div>
  );
}
