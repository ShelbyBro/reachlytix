import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  accept?: string;
  multiple?: boolean;
}

export function DropZone({ 
  onFileSelect, 
  isUploading, 
  accept = ".csv",
  multiple = false 
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const isValid = file.type === 'text/csv' || file.name.endsWith('.csv');
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a CSV file`
        });
      }
      return isValid;
    });
    
    if (validFiles.length === 0) return;
    
    if (multiple) {
      validFiles.forEach(file => onFileSelect(file));
    } else {
      onFileSelect(validFiles[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.type === 'text/csv' || file.name.endsWith('.csv');
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a CSV file`
        });
      }
      return isValid;
    });
    
    if (validFiles.length === 0) return;
    
    if (multiple) {
      validFiles.forEach(file => onFileSelect(file));
    } else {
      onFileSelect(validFiles[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-primary bg-primary/10" : "border-border"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-lg font-medium">
        Drop your {multiple ? "CSV files" : "CSV file"} here, or{" "}
        <label className="text-primary cursor-pointer hover:underline">
          browse
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
            disabled={isUploading}
            multiple={multiple}
          />
        </label>
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        CSV should include: name, email, phone, source
      </p>
    </div>
  );
}
