
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

interface NewApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type FormValues = {
  merchant_id: string;
  lender_id: string;
};

type Merchant = {
  id: string;
  name: string;
}

type Lender = {
  id: string;
  name: string;
}

export function NewApplicationDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: NewApplicationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [lenders, setLenders] = useState<Lender[]>([]);
  
  const form = useForm<FormValues>({
    defaultValues: {
      merchant_id: "",
      lender_id: ""
    }
  });
  
  // Fetch merchants and lenders when dialog opens
  useEffect(() => {
    if (open) {
      fetchMerchants();
      fetchLenders();
    }
  }, [open]);
  
  async function fetchMerchants() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const { data, error } = await supabase
        .from('merchants')
        .select('id, name')
        .eq('iso_id', userData.user.id)
        .eq('status', 'active');
        
      if (error) throw error;
      setMerchants(data || []);
    } catch (error) {
      console.error("Error fetching merchants:", error);
      toast.error("Failed to load merchants");
    }
  }
  
  async function fetchLenders() {
    try {
      const { data, error } = await supabase
        .from('lenders')
        .select('id, name')
        .eq('status', 'active');
        
      if (error) throw error;
      setLenders(data || []);
    } catch (error) {
      console.error("Error fetching lenders:", error);
      toast.error("Failed to load lenders");
    }
  }
  
  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      
      // Get current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Not authenticated");
      }
      
      // Insert the new application
      const { error } = await supabase.from("applications").insert({
        merchant_id: values.merchant_id,
        lender_id: values.lender_id,
        iso_id: userData.user.id,
        status: "pending" // Default status for new applications
      });
      
      if (error) throw error;
      
      // Reset the form
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit New Application</DialogTitle>
          <DialogDescription>
            Apply for funding for one of your merchants.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="merchant_id"
              rules={{ required: "Merchant is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Merchant</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select merchant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {merchants.map((merchant) => (
                        <SelectItem key={merchant.id} value={merchant.id}>{merchant.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lender_id"
              rules={{ required: "Lender is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Lender</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lenders.map((lender) => (
                        <SelectItem key={lender.id} value={lender.id}>{lender.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                type="button"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
