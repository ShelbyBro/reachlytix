
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Merchant, Lender } from "@/types/iso";

// Define the form schema
const formSchema = z.object({
  merchant_id: z.string({
    required_error: "Please select a merchant",
  }),
  lender_id: z.string({
    required_error: "Please select a lender",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewApplicationDialog({ open, onOpenChange, onSuccess }: NewApplicationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch merchants for the current ISO
  const { data: merchants, isLoading: isLoadingMerchants } = useQuery({
    queryKey: ['merchant-options'],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");
        
        const { data, error } = await supabase
          .from('merchants')
          .select('id, name, business_type')
          .eq('iso_id', userData.user.id)
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        
        return data as Merchant[];
      } catch (error) {
        console.error("Error fetching merchants:", error);
        throw error;
      }
    }
  });
  
  // Fetch lenders
  const { data: lenders, isLoading: isLoadingLenders } = useQuery({
    queryKey: ['lender-options'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('lenders')
          .select('id, name, interest_rate, type')
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        
        return data as Lender[];
      } catch (error) {
        console.error("Error fetching lenders:", error);
        throw error;
      }
    }
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merchant_id: "",
      lender_id: "",
      notes: "",
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      
      // Insert the application into the database
      const { error } = await supabase
        .from('applications')
        .insert({
          merchant_id: values.merchant_id,
          lender_id: values.lender_id,
          iso_id: userData.user.id,
          notes: values.notes || null,
          status: 'pending'
        });
      
      if (error) throw error;
      
      // Call onSuccess to refresh the parent component
      onSuccess();
      
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    form.reset();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit New Loan Application</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-2">
            <FormField
              control={form.control}
              name="merchant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isLoadingMerchants}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a merchant" />
                      </SelectTrigger>
                      <SelectContent>
                        {merchants?.map((merchant) => (
                          <SelectItem key={merchant.id} value={merchant.id}>
                            {merchant.name} ({merchant.business_type})
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
                    <Select
                      disabled={isLoadingLenders}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a lender" />
                      </SelectTrigger>
                      <SelectContent>
                        {lenders?.map((lender) => (
                          <SelectItem key={lender.id} value={lender.id}>
                            {lender.name} - {lender.type} ({lender.interest_rate}%)
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional information about this application..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
