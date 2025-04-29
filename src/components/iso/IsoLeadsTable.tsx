
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Eye, MessageSquare, ClipboardList, LoaderIcon } from "lucide-react";
import { IsoLead } from "@/hooks/use-iso-leads";

interface IsoLeadsTableProps {
  leads: IsoLead[];
  isLoading: boolean;
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
  onNoteAdd: (leadId: string, note: string) => Promise<void>;
  view: "assigned" | "in-progress" | "completed";
}

export function IsoLeadsTable({ 
  leads, 
  isLoading, 
  onStatusChange, 
  onNoteAdd, 
  view 
}: IsoLeadsTableProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  const handleAddNote = async () => {
    if (!selectedLeadId || !noteText.trim()) return;
    
    try {
      setSavingNote(true);
      await onNoteAdd(selectedLeadId, noteText);
      setNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setSavingNote(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      setSavingStatus(leadId);
      await onStatusChange(leadId, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setSavingStatus(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "assigned": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      case "under_review": return "bg-purple-500";
      case "approved": return "bg-green-500";
      case "declined": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoaderIcon className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading leads...</span>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center p-12">
        <p className="text-lg text-muted-foreground">No leads found in this category</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>
                <div>{lead.email}</div>
                <div>{lead.phone}</div>
              </TableCell>
              <TableCell>
                {view === "completed" ? (
                  <Badge className={getStatusBadgeColor(lead.status)}>
                    {lead.status.replace("_", " ")}
                  </Badge>
                ) : (
                  <Select
                    disabled={!!savingStatus}
                    defaultValue={lead.status}
                    onValueChange={(value) => handleStatusChange(lead.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell>{new Date(lead.updated_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedLeadId(lead.id)}>
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Lead Details</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div>
                          <h3 className="font-semibold mb-2">Personal Information</h3>
                          <p><span className="font-medium">Name:</span> {lead.name}</p>
                          <p><span className="font-medium">Email:</span> {lead.email}</p>
                          <p><span className="font-medium">Phone:</span> {lead.phone}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Status Information</h3>
                          <p><span className="font-medium">Current Status:</span> {lead.status.replace("_", " ")}</p>
                          <p><span className="font-medium">Created:</span> {new Date(lead.created_at).toLocaleString()}</p>
                          <p><span className="font-medium">Last Updated:</span> {new Date(lead.updated_at).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Documents</h3>
                        {lead.documents && lead.documents.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {lead.documents.map((doc, index) => (
                              <Button key={index} variant="outline" className="justify-start" asChild>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4 mr-2" />
                                  {doc.name}
                                </a>
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No documents available</p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Notes</h3>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 mb-4">
                          {lead.notes && lead.notes.length > 0 ? (
                            lead.notes.map((note, index) => (
                              <div key={index} className="mb-2 pb-2 border-b last:border-0">
                                <p className="text-sm">{note.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(note.timestamp).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No notes yet</p>
                          )}
                        </div>
                        <Textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a new note..."
                          className="mb-2"
                        />
                        <Button 
                          onClick={handleAddNote}
                          disabled={!noteText.trim() || savingNote}
                          className="w-full"
                        >
                          {savingNote ? (
                            <>
                              <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add Note
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ClipboardList className="h-4 w-4 mr-1" />
                        Notes
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Lead Notes</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-80 overflow-y-auto">
                        {lead.notes && lead.notes.length > 0 ? (
                          lead.notes.map((note, index) => (
                            <div key={index} className="mb-4 pb-4 border-b last:border-0">
                              <p>{note.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(note.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-center py-4 text-muted-foreground">No notes for this lead</p>
                        )}
                      </div>
                      <Textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a new note..."
                        className="mb-2"
                      />
                      <Button 
                        onClick={handleAddNote}
                        disabled={!noteText.trim() || savingNote}
                        className="w-full"
                      >
                        {savingNote ? "Saving..." : "Add Note"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
