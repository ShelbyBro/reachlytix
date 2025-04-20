
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dialPadKeys = [
  "1", "2", "3",
  "4", "5", "6",
  "7", "8", "9",
  "*", "0", "#"
];

interface DialPadProps {
  onKeyPress: (key: string) => void;
  disabled?: boolean;
}

export function DialPad({ onKeyPress, disabled }: DialPadProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {dialPadKeys.map((key) => (
        <Button
          key={key}
          variant="outline"
          disabled={disabled}
          onClick={() => onKeyPress(key)}
          className={cn(
            "h-14 w-14 text-xl font-semibold rounded-full",
            "bg-black/40 backdrop-blur-sm border border-white/10",
            "hover:bg-white/5 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(155,135,245,0.5)]",
            "transition-all duration-200 ease-out",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {key}
        </Button>
      ))}
    </div>
  );
}
