
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InlineLeadUploader } from "./InlineLeadUploader";
import { Upload } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadsUploaded: () => void;
};

export function UploadLeadsModal({ open, onOpenChange, onLeadsUploaded }: Props) {
  // The modal closes itself and informs parent after upload
  const handleLeadsUploaded = () => {
    onOpenChange(false);
    // Give a brief delay for closing animation, then call parent
    setTimeout(() => {
      onLeadsUploaded();
    }, 350);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Upload className="inline mr-2" /> Upload Leads CSV
          </DialogTitle>
          <DialogDescription>
            Import your lead list to quickly assign them to this campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <InlineLeadUploader onLeadsUploaded={handleLeadsUploaded} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
