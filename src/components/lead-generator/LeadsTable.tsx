
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LoaderIcon, Save } from "lucide-react";
import { Lead } from "@/hooks/use-smart-scrape";

interface LeadsTableProps {
  leads: Lead[];
  savingIndices: number[];
  onSaveLead: (lead: Lead, index: number) => void;
}

export function LeadsTable({ leads, savingIndices, onSaveLead }: LeadsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead, index) => (
            <TableRow key={index}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.phone}</TableCell>
              <TableCell className="max-w-[180px] truncate">{lead.email}</TableCell>
              <TableCell className="max-w-[180px] truncate">
                {lead.website ? (
                  <a 
                    href={lead.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {lead.website}
                  </a>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell className="max-w-[180px] truncate">
                {lead.address || "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSaveLead(lead, index)}
                  disabled={savingIndices.includes(index)}
                >
                  {savingIndices.includes(index) ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
