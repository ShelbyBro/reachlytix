
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface SchedulingFieldProps {
  scheduledDate: Date | undefined;
  onScheduledDateChange: (date: Date | undefined) => void;
}

export function SchedulingField({
  scheduledDate,
  onScheduledDateChange
}: SchedulingFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Schedule (Optional)</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${
              !scheduledDate && "text-muted-foreground"
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {scheduledDate ? format(scheduledDate, "PPP") : "Schedule campaign"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={scheduledDate}
            onSelect={onScheduledDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
