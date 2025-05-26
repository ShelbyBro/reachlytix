
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

// Simple CSV parsing utility
export function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const rows = lines.slice(1).map(line => {
    const values = line.split(",");
    const row: any = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || "").trim();
    });
    return row;
  });
  return rows;
}

type Lead = {
  name?: string;
  email?: string;
  phone?: string;
};

export default function EmailCsvUploader({
  onLeadsUploaded
}: { onLeadsUploaded?: (leads: Lead[]) => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const text = await file.text();
      const parsedLeads = parseCsv(text)
        .filter(l => l && (l.email || l.phone));

      // Basic header check
      if (parsedLeads.length === 0) {
        setError("No valid leads found. Make sure your CSV has 'email' or 'phone'.");
        setLeads([]);
        setFileName("");
        setUploading(false);
        return;
      }
      setLeads(parsedLeads);
      setFileName(file.name);
      if (onLeadsUploaded) onLeadsUploaded(parsedLeads);
    } catch (e: any) {
      setError("Failed to process file: " + (e?.message || "Unknown error"));
    }
    setUploading(false);
  };

  const handleFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    handleUpload(file);
  };

  const handleClear = () => {
    setLeads([]);
    setFileName("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 font-semibold">
        <Upload className="h-5 w-5 text-primary" />
        Upload Recipients (CSV)
      </div>
      {!leads.length ? (
        <>
          <input
            type="file"
            accept=".csv"
            className="mt-2"
            disabled={uploading}
            onChange={handleFileChange}
          />
          <div className="text-xs text-muted-foreground">
            (Columns required: name, email, phone. Only recipients uploaded here will receive this campaign.)
          </div>
        </>
      ) : (
        <div className="rounded border bg-muted px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">{fileName}</span>
            <Button size="icon" variant="ghost" className="ml-2" onClick={handleClear}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm">
            <b>{leads.length}</b> lead{leads.length === 1 ? "" : "s"} uploaded.
          </div>
        </div>
      )}
      {error && <div className="text-xs text-red-500">{error}</div>}
      {leads.length > 0 && (
        <div className="mt-1">
          <div className="text-xs text-muted-foreground">
            Need a different file? <Button variant="link" size="sm" className="px-0 h-4" onClick={handleClear}>Remove uploaded leads</Button>
          </div>
          <div className="pt-2 border-t mt-2">
            <div className="font-bold mb-1 text-xs">Sample:</div>
            <ul className="text-xs leading-tight max-h-24 overflow-y-auto">
              {leads.slice(0, 5).map((l, i) => (
                <li key={i}>{l.name || "No Name"} – {l.email || l.phone || "No Contact"}</li>
              ))}
              {leads.length > 5 &&
                <li className="opacity-60">...and {leads.length - 5} more.</li>
              }
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
