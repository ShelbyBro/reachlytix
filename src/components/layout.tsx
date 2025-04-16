
import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";

interface LayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

export default function Layout({ children, isAdmin = false }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
