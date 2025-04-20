import { useState, useEffect } from "react";
import { Phone, Mic, MicOff, Video, VideoOff, X, AudioWaveform } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallHistoryCard } from "@/components/voip/CallHistoryCard";
import { AutoCallFeature } from "@/components/voip/AutoCallFeature";

export default function VoipPage() {
  const [isCalling, setIsCalling] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [number, setNumber] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState<string>("00:00");
  const [status, setStatus] = useState<"Idle" | "Calling" | "Connected" | "Ended">("Idle");
  let timerInterval: NodeJS.Timeout;

  const { toast } = useToast();

  const handleCallClick = () => {
    if (!number) {
      toast({
        title: "No phone number",
        description: "Please enter a phone number to call",
        variant: "destructive",
      });
      return;
    }
    
    let formattedNumber = number;
    if (!number.startsWith('+')) {
      formattedNumber = `+${number.replace(/\D/g, '')}`;
    }
    
    setNumber(formattedNumber);
    setIsDialogOpen(true);
  };

  const handleConfirmCall = async () => {
    setIsLoading(true);
    setIsDialogOpen(false);
    
    try {
      let formattedNumber = number;
      if (!number.startsWith('+')) {
        formattedNumber = `+${number.replace(/\D/g, '')}`;
      }
      
      const { data, error } = await supabase.functions.invoke('make-call', {
        body: { to: formattedNumber }
      });
      
      if (error) {
        console.error("Error making call:", error);
        toast({
          title: "Call Failed",
          description: error.message || "There was an error placing your call.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (data.error) {
        console.error("Twilio error:", data.error);
        toast({
          title: "Call Failed",
          description: data.error || "There was an error with the call service.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Call Initiated",
        description: `Connecting call to ${formattedNumber}...`,
      });
      setIsCalling(true);
      
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = () => {
    setIsCalling(false);
    toast({
      title: "Call Ended",
      description: "The call has been terminated.",
    });
  };

  const simulateCall = async () => {
    setStatus("Calling");
    setIsCalling(true);
    setIsDialogOpen(false);
    startTimer();

    setTimeout(() => {
      setStatus("Connected");
    }, 2000);

    setTimeout(() => {
      setStatus("Ended");
      setIsCalling(false);
      clearInterval(timerInterval);
      toast({
        title: "Call Completed",
        description: "Call simulation completed ✅",
      });
    }, 5000);
  };

  const startTimer = () => {
    let seconds = 0;
    timerInterval = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setTimer(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-primary text-transparent bg-clip-text">
              VOIP Caller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Lead Name</p>
                <p className="font-semibold text-lg">Zayan Rahman</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone Number</p>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    placeholder="Enter phone number (e.g., +1234567890)"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    disabled={isCalling}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AudioWaveform className={`h-5 w-5 ${status === "Connected" ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
                <span className="font-mono">{timer}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  status === "Connected" ? "bg-green-100 text-green-700" :
                  status === "Calling" ? "bg-yellow-100 text-yellow-700" :
                  status === "Ended" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {status}
                </span>
              </div>

              {!isCalling ? (
                <Button onClick={() => setIsDialogOpen(true)} className="w-auto" disabled={!number}>
                  <Phone className="mr-2 h-5 w-5" /> Start Call
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={handleEndCall}>
                    <X className="mr-2 h-4 w-4" /> End
                  </Button>
                  <Button
                    onClick={() => setMicOn(!micOn)}
                    variant={micOn ? "outline" : "secondary"}
                  >
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    onClick={() => setVideoOn(!videoOn)}
                    variant={videoOn ? "outline" : "secondary"}
                  >
                    {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800 text-sm">
          Real call integration via Twilio is in progress...
        </div>

        <CallHistoryCard />
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
              <AlertDialogAction onClick={simulateCall}>
                Place Call
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
