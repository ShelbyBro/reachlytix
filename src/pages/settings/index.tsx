
import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, User, Building, Lock, Mail } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { ProfileSettings } from "./components/ProfileSettings";
import { SecuritySettings } from "./components/SecuritySettings";
import { CrmSettings } from "./components/CrmSettings";
import { UserManagement } from "./components/UserManagement";

export default function Settings() {
  const { loading } = useAuth();
  const { isAdmin } = useUserRole();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              <span>Profile</span>
            </TabsTrigger>
            
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock size={16} />
              <span>Security</span>
            </TabsTrigger>
            
            {isAdmin() && (
              <TabsTrigger value="crm" className="flex items-center gap-2">
                <Mail size={16} />
                <span>CRM Settings</span>
              </TabsTrigger>
            )}
            
            {isAdmin() && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>User Management</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
          
          {isAdmin() && (
            <TabsContent value="crm">
              <CrmSettings />
            </TabsContent>
          )}
          
          {isAdmin() && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
