
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Add this import
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface CallControlsProps {
  isInCall: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onCall: () => void;
  onHangup: () => void;
}

export function CallControls({
  isInCall,
  isMuted,
  isSpeakerOn,
  onToggleMute,
  onToggleSpeaker,
  onCall,
  onHangup,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6 mt-8">
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm hover:bg-white/5"
        onClick={onToggleMute}
      >
        {isMuted ? <MicOff /> : <Mic />}
      </Button>

      <Button
        size="lg"
        className={cn(
          "h-16 w-16 rounded-full",
          "transition-all duration-300",
          isInCall
            ? "bg-red-500 hover:bg-red-600 btn-futuristic"
            : "bg-green-500 hover:bg-green-600 btn-futuristic"
        )}
        onClick={isInCall ? onHangup : onCall}
      >
        {isInCall ? <PhoneOff className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm hover:bg-white/5"
        onClick={onToggleSpeaker}
      >
        {isSpeakerOn ? <Volume2 /> : <VolumeX />}
      </Button>
    </div>
  );
}
