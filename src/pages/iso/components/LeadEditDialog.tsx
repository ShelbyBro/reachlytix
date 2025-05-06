
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { IsoLead } from "./IsoLeadsTable";

interface Agent {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface LeadEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLead: IsoLead | null;
  agents?: Agent[];
  form: UseFormReturn<{
    status: string;
    assigned_agent_id: string;
  }>;
  onSubmit: (values: { status: string; assigned_agent_id: string }) => void;
}

export function LeadEditDialog({
  open,
  onOpenChange,
  selectedLead,
  agents,
  form,
  onSubmit,
}: LeadEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update the lead status or assign an agent.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assigned_agent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Agent</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {agents?.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.first_name} {agent.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
