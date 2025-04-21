import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  Megaphone, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Users,
  LogOut,
  UserPlus,
  Mail,
  Activity,
  Search,
  Wand2,
  Phone,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type SidebarProps = {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  
  const clientLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: UserPlus, label: "Add Lead", href: "/leads/add" },
    { icon: Upload, label: "Upload Leads", href: "/upload" },
    { icon: Megaphone, label: "Campaign Manager", href: "/campaigns" },
    { icon: Mail, label: "Create Campaign", href: "/campaigns/create" },
    { icon: Phone, label: "VOIP Caller", href: "/voip" },
    { icon: Bot, label: "AI Agent Zone", href: "/ai-agents" },
    { icon: Activity, label: "Analytics", href: "/analytics" },
    { icon: Search, label: "Lead Generator", href: "/lead-generator" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];
  
  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Upload, label: "Leads", href: "/admin/leads" },
    { icon: Megaphone, label: "Campaigns", href: "/admin/campaigns" },
    { icon: BarChart3, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];
  
  const links = isAdmin ? adminLinks : clientLinks;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
          <Link to="/">
            {!collapsed && (
              <span className="font-bold text-lg bg-gradient-primary text-transparent bg-clip-text">Reachlytix</span>
            )}
            {collapsed && <span className="font-bold text-xl">R</span>}
          </Link>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center h-10 px-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent group transition-colors",
                location.pathname === link.href && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
              )}
            >
              <link.icon
                size={20}
                className={cn(
                  "min-w-[20px]",
                  location.pathname === link.href ? "text-sidebar-primary-foreground" : "text-sidebar-foreground"
                )}
              />
              {!collapsed && <span className="ml-3">{link.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full h-10 px-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
