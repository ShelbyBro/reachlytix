
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { DialPad } from "@/components/voip/DialPad";
import { CallControls } from "@/components/voip/CallControls";
import { CallDisplay } from "@/components/voip/CallDisplay";
import { AutoCallFeature } from "@/components/voip/AutoCallFeature";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function VoipPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [number, setNumber] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "calling" | "connected" | "ended" | "failed">("idle");
  const [startTime, setStartTime] = useState<Date>();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleKeyPress = (key: string) => {
    if (status === "idle") {
      setNumber(prev => prev + key);
    }
  };

  const handleCall = async () => {
    if (!number) {
      toast({
        title: "No phone number",
        description: "Please enter a phone number to call",
        variant: "destructive",
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleConfirmCall = async () => {
    setIsLoading(true);
    setIsDialogOpen(false);
    setStatus("calling");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("No authentication token available");
      }

      const formattedNumber = number.startsWith('+') ? number : `+${number.replace(/\D/g, '')}`;
      
      const response = await fetch("https://szkhnwedzwvlqlktgvdp.supabase.co/functions/v1/make-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ to: formattedNumber }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to make call");
      }

      setStatus("connected");
      setStartTime(new Date());
      
      toast({
        title: "Call Connected",
        description: `Connected to ${formattedNumber}`,
      });
    } catch (error) {
      console.error("Call error:", error);
      setStatus("failed");
      toast({
        title: "Call Failed",
        description: error instanceof Error ? error.message : "Failed to place call",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHangup = () => {
    setStatus("ended");
    setStartTime(undefined);
    toast({
      title: "Call Ended",
      description: "The call has been terminated",
    });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-8 p-6">
        <div className="glass-card p-8 space-y-6">
          <Input
            type="tel"
            value={number}
            onChange={(e) => status === "idle" && setNumber(e.target.value)}
            placeholder="Enter phone number..."
            className="text-center text-2xl font-mono bg-black/40 backdrop-blur-sm border-white/10"
            disabled={status !== "idle"}
          />

          <CallDisplay status={status} startTime={startTime} />

          <DialPad
            onKeyPress={handleKeyPress}
            disabled={status !== "idle"}
          />

          <CallControls
            isInCall={status === "connected"}
            isMuted={isMuted}
            isSpeakerOn={isSpeakerOn}
            onToggleMute={() => setIsMuted(prev => !prev)}
            onToggleSpeaker={() => setIsSpeakerOn(prev => !prev)}
            onCall={handleCall}
            onHangup={handleHangup}
          />
        </div>

        <AutoCallFeature />

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Call</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to place a call to {number}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCall} disabled={isLoading}>
                Place Call
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
