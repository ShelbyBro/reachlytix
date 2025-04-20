
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioWaveform } from "lucide-react";
import { format } from "date-fns";

interface CallHistoryEntry {
  date: Date;
  leadName: string;
  status: string;
  duration: string;
}

export function CallHistoryCard() {
  // Dummy data for demonstration
  const recentCall: CallHistoryEntry = {
    date: new Date(),
    leadName: "Zayan Rahman",
    status: "Completed",
    duration: "00:03:45"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AudioWaveform className="h-5 w-5 text-primary" />
          Recent Call History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date/Time</p>
              <p className="font-medium">{format(recentCall.date, 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lead Name</p>
              <p className="font-medium">{recentCall.leadName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium text-green-600">{recentCall.status}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">{recentCall.duration}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
