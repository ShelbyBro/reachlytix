
import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { useUserRole } from "@/hooks/use-user-role";

interface LayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

export default function Layout({ children, isAdmin = false }: LayoutProps) {
  const { isAdmin: userIsAdmin, isIso } = useUserRole();
  
  // Determine if we should show admin sidebar based on props or user role
  const showAdminSidebar = isAdmin || userIsAdmin();
  // Determine if we should show ISO sidebar
  const showIsoSidebar = isIso();
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isAdmin={showAdminSidebar} 
        isIso={showIsoSidebar} 
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
