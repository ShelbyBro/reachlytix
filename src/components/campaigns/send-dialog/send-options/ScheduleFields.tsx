
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ScheduleFieldsProps {
  scheduledDate: Date | undefined;
  onScheduledDateChange: (date: Date | undefined) => void;
  scheduledTime: string;
  onScheduledTimeChange: (time: string) => void;
}

export function ScheduleFields({
  scheduledDate,
  onScheduledDateChange,
  scheduledTime,
  onScheduledTimeChange
}: ScheduleFieldsProps) {
  return (
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
  );
}
