
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Merchant } from "../merchants/IsoMerchants";
import { Lender } from "../lenders/IsoLenders";

interface NewApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormValues {
  merchant_id: string;
  lender_id: string;
}

export function NewApplicationDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: NewApplicationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({
    defaultValues: {
      merchant_id: "",
      lender_id: ""
    }
  });
  
  // Fetch merchants for the current ISO
  const { data: merchants, isLoading: loadingMerchants } = useQuery({
    queryKey: ['user-merchants'],
    queryFn: async () => {
      // Placeholder for real merchant query when table exists
      return [] as Merchant[];
    }
  });
  
  // Fetch active lenders
  const { data: lenders, isLoading: loadingLenders } = useQuery({
    queryKey: ['active-lenders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lenders')
        .select('*')
        .eq('status', 'active')
        .order('name');
        
      if (error) throw error;
      return data as Lender[];
    }
  });
  
  // Reset form on close
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Get the current user's ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      
      // Placeholder for real submission when table exists
      console.log("Would submit application:", {
        merchant_id: values.merchant_id,
        lender_id: values.lender_id,
        iso_id: userData.user.id,
        status: "pending"
      });
      
      toast.success("Application submitted successfully");
      onSuccess();
      
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Loan Application</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="merchant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant</FormLabel>
                  <FormControl>
                    <Select disabled={loadingMerchants} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a merchant" />
                      </SelectTrigger>
                      <SelectContent>
                        {merchants?.map((merchant) => (
                          <SelectItem key={merchant.id} value={merchant.id}>
                            {merchant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lender_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lender</FormLabel>
                  <FormControl>
                    <Select disabled={loadingLenders} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a lender" />
                      </SelectTrigger>
                      <SelectContent>
                        {lenders?.map((lender) => (
                          <SelectItem key={lender.id} value={lender.id}>
                            {lender.name} ({lender.interest_rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
