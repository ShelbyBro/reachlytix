
import { useState } from "react";
import { Phone, Mic, MicOff, Video, VideoOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";

export default function VoipPage() {
  const [isCalling, setIsCalling] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [number, setNumber] = useState("");

  const handleCall = () => {
    setIsCalling(true);
    // TODO: integrate Twilio or WAPI call handler
  };

  const handleEndCall = () => {
    setIsCalling(false);
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
            placeholder="Enter phone number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {!isCalling ? (
            <Button onClick={handleCall} className="w-full">
              <Phone className="mr-2 h-5 w-5" /> Start Call
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
            Calling {number}...
          </div>
        )}
      </div>
    </Layout>
  );
}

