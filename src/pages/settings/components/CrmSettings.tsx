
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useCrmSettings } from "../hooks/use-crm-settings";

export function CrmSettings() {
  const { emailSenderName, setEmailSenderName, updateCrmSettings } = useCrmSettings();

  return (
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
  );
}
