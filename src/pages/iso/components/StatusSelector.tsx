
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";

interface StatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  isDisabled?: boolean;
}

const STATUS_OPTIONS = [
  { value: "unassigned", label: "Unassigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
  { value: "follow_up", label: "Follow-Up" }
];

export function StatusSelector({ currentStatus, onStatusChange, isDisabled = false }: StatusSelectorProps) {
  // Make sure we have a valid status and it's not an empty string
  const validStatus = currentStatus && STATUS_OPTIONS.some(option => option.value === currentStatus)
    ? currentStatus 
    : "unassigned";  // Default to "unassigned" if status is empty or invalid

  return (
    <Select 
      defaultValue={validStatus}
      onValueChange={onStatusChange}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-[140px] h-8">
        <SelectValue>
          <StatusBadge status={validStatus} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
            <StatusBadge status={option.value} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
