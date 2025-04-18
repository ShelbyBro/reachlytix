
import { Button } from "@/components/ui/button";
import { CsvRow } from "@/utils/csv-parser";
import { Eye, EyeOff } from "lucide-react";

interface DataPreviewProps {
  data: CsvRow[];
  selectedSource: string;
  selectedCampaign: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function DataPreview({
  data,
  selectedSource,
  isVisible,
  onToggleVisibility
}: DataPreviewProps) {
  if (!data.length) return null;

  const validCount = data.filter(row => row.isValid).length;
  const invalidCount = data.length - validCount;

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">
          Data Preview ({data.length} Rows - {validCount} Valid, {invalidCount} Invalid)
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleVisibility}
          className="flex items-center gap-1"
        >
          {isVisible ? (
            <>
              <EyeOff className="h-4 w-4" /> Hide
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" /> Show
            </>
          )}
        </Button>
      </div>
      
      {isVisible && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="p-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="p-2 text-left text-xs font-medium text-muted-foreground">Email</th>
                <th className="p-2 text-left text-xs font-medium text-muted-foreground">Phone</th>
                <th className="p-2 text-left text-xs font-medium text-muted-foreground">Source</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, index) => (
                <tr key={index} className={index % 2 ? "bg-muted/20" : ""}>
                  <td className="p-2 text-sm">
                    {row.isValid ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500" title={row.invalidReason}>✗</span>
                    )}
                  </td>
                  <td className="p-2 text-sm">{row.name}</td>
                  <td className="p-2 text-sm">{row.email || '—'}</td>
                  <td className="p-2 text-sm">{row.phone || '—'}</td>
                  <td className="p-2 text-sm">{selectedSource || row.source || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing first 10 rows of {data.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
