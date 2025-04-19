
import { useState } from "react";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CallsTable } from "@/components/voip/CallsTable";
import Layout from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";

export default function VoipDashboard() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isAIAgent, setIsAIAgent] = useState(false);

  const handleCall = async () => {
    if (!phoneNumber) return;

    await supabase.from('call_logs').insert({
      number: phoneNumber,
      type: 'outbound',
      status: 'initiated'
    });

    setPhoneNumber("");
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">VoIP Dashboard</h2>
          <p className="text-muted-foreground">
            Make and manage calls through our VoIP system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4 col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button onClick={handleCall}>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ai-mode"
                checked={isAIAgent}
                onCheckedChange={setIsAIAgent}
              />
              <Label htmlFor="ai-mode">AI Call Agent</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recent Calls</h3>
          <CallsTable />
        </div>
      </div>
    </Layout>
  );
}
