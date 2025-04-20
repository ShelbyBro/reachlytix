
import { useState } from "react";
import { Phone, Mic, MicOff, Video, VideoOff, X } from "lucide-react";
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

export default function VoipPage() {
  const [isCalling, setIsCalling] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [number, setNumber] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    
    // Format the phone number if it doesn't have a + prefix
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
      // Format the phone number if needed to ensure E.164 format
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
      
      // Call successfully initiated
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-20 bg-background shadow-xl rounded-2xl p-6 border">
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-primary text-transparent bg-clip-text">
          VOIP Caller
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="tel"
            placeholder="Enter phone number (e.g., +1234567890)"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            disabled={isCalling || isLoading}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {!isCalling ? (
            <Button 
              onClick={handleCallClick} 
              className="w-full"
              disabled={isLoading || !number}
            >
              {isLoading ? (
                <span className="animate-pulse">Connecting...</span>
              ) : (
                <>
                  <Phone className="mr-2 h-5 w-5" /> Start Call
                </>
              )}
            </Button>
          ) : (
            <div className="flex justify-between items-center w-full gap-3">
              <Button variant="destructive" onClick={handleEndCall} className="flex-1">
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

        {isCalling && (
          <div className="text-center mt-6 text-muted-foreground animate-pulse">
            Call in progress to {number}...
          </div>
        )}
      </div>

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
            <AlertDialogAction onClick={handleConfirmCall}>
              Place Call
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
