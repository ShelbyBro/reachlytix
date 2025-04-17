
import { useState } from "react";
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
import { AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewCampaignDialog() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate loading
    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);
      toast({
        title: "Campaign Mockup Created",
        description: "This is a demo feature. No data was saved.",
        variant: "default",
      });
      
      // Reset form
      setName("");
      setType("");
      setBudget("");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload New Campaign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            Mock Upload Only – No Data Will Be Saved
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input 
                id="name" 
                placeholder="Enter campaign name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Campaign Type</Label>
              <Input 
                id="type" 
                placeholder="Email, Social, etc." 
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget">Budget</Label>
              <Input 
                id="budget" 
                placeholder="Enter budget" 
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex gap-2"
            >
              {isSubmitting ? "Creating..." : "Create Campaign"}
              {!isSubmitting && <Check className="h-4 w-4" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
