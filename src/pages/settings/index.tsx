
import Layout from "@/components/layout";

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="grid gap-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <p className="text-muted-foreground">
              Configure your account preferences and settings.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              More settings options coming soon.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
