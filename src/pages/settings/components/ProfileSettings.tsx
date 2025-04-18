
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileSettings } from "../hooks/use-profile-settings";

export function ProfileSettings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { firstName, lastName, saving, updateProfile, setFirstName, setLastName } = useProfileSettings();

  return (
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
  );
}
