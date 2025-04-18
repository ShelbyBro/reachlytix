
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSecuritySettings } from "../hooks/use-security-settings";

export function SecuritySettings() {
  const { sendPasswordReset } = useSecuritySettings();

  return (
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
  );
}
