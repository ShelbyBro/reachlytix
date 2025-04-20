
import { useEffect, useState } from "react";

interface CallDisplayProps {
  status: "idle" | "calling" | "connected" | "ended" | "failed";
  startTime?: Date;
}

export function CallDisplay({ status, startTime }: CallDisplayProps) {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (status !== "connected" || !startTime) return;

    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      setElapsed(
        `${minutes.toString().padStart(2, "0")}:${remainingSeconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [status, startTime]);

  const statusText = {
    idle: "Ready to call",
    calling: "Calling...",
    connected: "In call",
    ended: "Call ended",
    failed: "Call failed",
  }[status];

  return (
    <div className="text-center space-y-2">
      <p className="text-lg font-medium text-gradient">{statusText}</p>
      {status === "connected" && (
        <p className="text-2xl font-mono text-primary">{elapsed}</p>
      )}
    </div>
  );
}
