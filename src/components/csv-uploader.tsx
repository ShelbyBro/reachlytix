import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCSVUpload } from "@/hooks/use-csv-upload";
import { Badge } from "@/components/ui/badge";

export function CsvUploaderComponent() {
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const {
    file,
    setFile,
    parseFile,
    handleUpload,
    resetState,
    parsedData,
    previewVisible,
    setPreviewVisible,
    isUploading,
    uploadError,
    userLeads,
    fetchUserLeads,
    fetchingLeads,
    uploadHistory
  } = useCSVUpload({ selectedSource, selectedCampaign });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    parseFile(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Label htmlFor="source">Lead Source</Label>
          <Select onValueChange={setSelectedSource}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="cold-call">Cold Call</SelectItem>
              <SelectItem value="social-media">Social Media</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="campaign">Campaign</Label>
          <Input
            type="text"
            id="campaign"
            placeholder="Enter campaign name"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          />
        </div>
      </div>

      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer bg-muted/50"
      >
        <input {...getInputProps()} />
        {file ? (
          <p>Selected file: {file.name}</p>
        ) : (
          <p>Drag 'n' drop a CSV file here, or click to select file</p>
        )}
      </div>

      {uploadError && (
        <div className="mt-4 text-red-500 text-sm">{uploadError}</div>
      )}

      {previewVisible && parsedData.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">CSV Preview</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A preview of the parsed data from the CSV file.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Name</TableHead>
                  <TableHead className="text-left">Email</TableHead>
                  <TableHead className="text-left">Phone</TableHead>
                  <TableHead className="text-left">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>
                      {row.isValid ? (
                        <Badge variant="outline">Valid</Badge>
                      ) : (
                        <Badge variant="destructive">Invalid: {row.invalidReason}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="secondary" size="sm" onClick={() => setPreviewVisible(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedSource}
            >
              {isUploading ? "Uploading..." : "Upload Leads"}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Upload History</h2>
        <div className="border rounded-md p-2 bg-muted/30">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-1 px-2">Filename</th>
                <th className="text-left py-1 px-2">Type</th>
                <th className="text-left py-1 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.length === 0 ? (
                <tr>
                  <td className="py-2 px-2" colSpan={3}>No uploads yet.</td>
                </tr>
              ) : (
                uploadHistory.map((h, idx) => (
                  <tr key={idx}>
                    <td className="py-1 px-2">{h.filename}</td>
                    <td className="py-1 px-2">{h.type}</td>
                    <td className="py-1 px-2">{h.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
