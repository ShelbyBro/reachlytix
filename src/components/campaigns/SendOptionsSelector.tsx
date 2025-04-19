
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { SendIcon, CalendarCheck, CalendarIcon, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface SendOptionsSelectorProps {
  sendMode: "now" | "schedule";
  onSendModeChange: (mode: "now" | "schedule") => void;
  scheduledDate: Date | undefined;
  onScheduledDateChange: (date: Date | undefined) => void;
  scheduledTime: string;
  onScheduledTimeChange: (time: string) => void;
}

export function SendOptionsSelector({
  sendMode,
  onSendModeChange,
  scheduledDate,
  onScheduledDateChange,
  scheduledTime,
  onScheduledTimeChange
}: SendOptionsSelectorProps) {
  return (
    <div className="space-y-4">
      <RadioGroup 
        value={sendMode} 
        onValueChange={(val) => onSendModeChange(val as "now" | "schedule")}
        className="flex flex-col space-y-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="now" id="now" />
          <Label htmlFor="now" className="flex items-center">
            <SendIcon className="w-4 h-4 mr-2" /> Send Now
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="schedule" id="schedule" />
          <Label htmlFor="schedule" className="flex items-center">
            <CalendarCheck className="w-4 h-4 mr-2" /> Schedule Send
          </Label>
        </div>
      </RadioGroup>
      
      {sendMode === "schedule" && (
        <div className="space-y-4 pl-6 pt-2">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? (
                    format(scheduledDate, "PPP")
                  ) : (
                    <span>Select a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={onScheduledDateChange}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>Select Time</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => onScheduledTimeChange(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
