
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure your account preferences and settings.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                More settings options coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
