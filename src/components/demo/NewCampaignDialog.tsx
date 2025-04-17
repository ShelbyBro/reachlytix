
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DemoFeatureTooltip } from "./DemoFeatureTooltip";

export function NewCampaignDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upload New Campaign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Demo version: Changes won't be saved.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" placeholder="Enter campaign name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Campaign Type</Label>
            <Input id="type" placeholder="Email, Social, etc." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budget">Budget</Label>
            <Input id="budget" placeholder="Enter budget" type="number" />
          </div>
        </div>
        <DialogFooter>
          <DemoFeatureTooltip>
            <Button type="submit">Create Campaign</Button>
          </DemoFeatureTooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
