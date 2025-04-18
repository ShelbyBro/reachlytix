
import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, User, Building } from "lucide-react";

export default function Settings() {
  const { user, profile, isAdmin } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
    
    if (isAdmin()) {
      fetchClients();
    }
  }, [profile]);

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
            
            {isAdmin() && (
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Building size={16} />
                <span>Clients</span>
              </TabsTrigger>
            )}
            
            {isAdmin() && (
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>User Roles</span>
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
                  <div className="grid grid-cols-2 gap-4">
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
                      value={profile?.role || ""}
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
            <TabsContent value="roles">
              <Card>
                <CardHeader>
                  <CardTitle>User Role Management</CardTitle>
                  <CardDescription>
                    Manage user roles and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-6 text-muted-foreground">
                    Role management functionality coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
