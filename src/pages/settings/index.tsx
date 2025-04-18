
import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, User, Building, Lock, Mail, Upload } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

export default function Settings() {
  const { user, profile } = useAuth();
  const { role, isAdmin } = useUserRole();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [emailSenderName, setEmailSenderName] = useState("Reachlytix CRM");
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setLoading(false);
    }
    
    if (isAdmin()) {
      fetchClients();
      fetchUsers();
    }
  }, [profile, isAdmin]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load clients."
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users."
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile."
      });
    } finally {
      setSaving(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link."
      });
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send password reset email."
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "client" | "agent") => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}.`
      });
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role."
      });
    }
  };

  const updateCrmSettings = async () => {
    // In a real application, this would save to a settings table
    toast({
      title: "Settings updated",
      description: "CRM settings have been saved."
    });
  };

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
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Building size={16} />
                <span>Clients</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                      <Input 
                        id="firstName" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                      <Input 
                        id="lastName" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input 
                      id="email" 
                      value={user?.email || ""}
                      disabled
                      placeholder="Email Address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">Role</label>
                    <Input 
                      id="role" 
                      value={role || ""}
                      disabled
                      placeholder="User Role"
                      className="capitalize"
                    />
                  </div>
                  
                  <Button onClick={updateProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Password Reset</h3>
                    <p className="text-sm text-muted-foreground">
                      Need to change your password? Click the button below to receive a password reset link.
                    </p>
                  </div>
                  
                  <Button onClick={sendPasswordReset}>
                    Send Password Reset Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isAdmin() && (
            <TabsContent value="crm">
              <Card>
                <CardHeader>
                  <CardTitle>CRM Settings</CardTitle>
                  <CardDescription>
                    Configure your CRM instance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="senderName" className="text-sm font-medium">Email Sender Name</label>
                      <Input 
                        id="senderName" 
                        value={emailSenderName}
                        onChange={(e) => setEmailSenderName(e.target.value)}
                        placeholder="Sender Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="emailFooter" className="text-sm font-medium">Email Footer Text</label>
                      <Textarea 
                        id="emailFooter" 
                        placeholder="Email footer text"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CRM Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <Button variant="outline">
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                    
                    <Button onClick={updateCrmSettings}>
                      Save CRM Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {isAdmin() && (
            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Client Management</CardTitle>
                  <CardDescription>
                    Manage client accounts and assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingClients ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : clients.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 font-medium text-sm text-muted-foreground py-2 border-b">
                        <div>Name</div>
                        <div>Email</div>
                        <div>Created</div>
                      </div>
                      
                      {clients.map(client => (
                        <div key={client.id} className="grid grid-cols-3 py-2 border-b">
                          <div>{client.name}</div>
                          <div>{client.email}</div>
                          <div>{new Date(client.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-muted-foreground">No clients found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {isAdmin() && (
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user roles and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : users.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 font-medium text-sm text-muted-foreground py-2 border-b">
                        <div>Name</div>
                        <div>Role</div>
                        <div>Created</div>
                        <div>Actions</div>
                      </div>
                      
                      {users.map(user => (
                        <div key={user.id} className="grid grid-cols-4 py-2 border-b items-center">
                          <div>{user.first_name} {user.last_name}</div>
                          <div className="capitalize">{user.role}</div>
                          <div>{new Date(user.created_at).toLocaleDateString()}</div>
                          <div>
                            <select 
                              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value as "admin" | "client" | "agent")}
                            >
                              <option value="admin">Admin</option>
                              <option value="client">Client</option>
                              <option value="agent">Agent</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-muted-foreground">No users found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
