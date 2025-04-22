
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LeadListInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function LeadListInput({ value, onChange }: LeadListInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="lead-list">Lead Phone Numbers</Label>
      <Textarea
        id="lead-list"
        placeholder="Enter phone numbers (comma-separated)"
        value={value}
        onChange={handleChange}
        className="font-mono"
      />
      <p className="text-xs text-muted-foreground">
        Enter phone numbers separated by commas (e.g., +1234567890, +0987654321)
      </p>
    </div>
  );
}
