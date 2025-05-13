
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
  
  // Fetch merchants
  const { data: merchants, isLoading: isLoadingMerchants } = useQuery({
    queryKey: ['merchant-options'],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");
        
        // Return mock data for merchants
        return [
          {
            id: '1',
            name: 'ABC Restaurant',
            business_type: 'Restaurant',
            contact_info: 'contact@abcrestaurant.com',
            status: 'active',
            notes: 'Good customer history',
            iso_id: userData.user.id,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'XYZ Retail',
            business_type: 'Retail',
            contact_info: 'info@xyzretail.com',
            status: 'pending',
            notes: 'New application',
            iso_id: userData.user.id,
            created_at: new Date().toISOString()
          }
        ] as Merchant[];
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
      // Return mock data for lenders
      return [
        {
          id: '1',
          name: 'First Capital Bank',
          interest_rate: 5.25,
          type: 'Term Loan',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Business Credit Union',
          interest_rate: 4.75,
          type: 'Line of Credit',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Merchant Advance',
          interest_rate: 8.5,
          type: 'Merchant Cash Advance',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ] as Lender[];
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
      
      // In a production app, we would insert into applications table
      // For now, just simulate a successful submission
      console.log("Submitting application:", {
        ...values,
        iso_id: userData.user.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
