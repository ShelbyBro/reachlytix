
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FilePreviewCardProps {
  file: File;
  rowCount: number;
  onRemove: () => void;
  parseProgress: number;
  isUploading: boolean;
}

export function FilePreviewCard({ 
  file, 
  rowCount, 
  onRemove, 
  parseProgress, 
  isUploading 
}: FilePreviewCardProps) {
  return (
    <Card className="p-4 border border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-primary/10 rounded mr-3">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(2)} KB • {rowCount} rows
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={isUploading}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <div className="h-2 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${parseProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Processing... {parseProgress}%
          </p>
        </div>
      )}
    </Card>
  );
}
