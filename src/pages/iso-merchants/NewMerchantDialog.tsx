
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";

const statusOptions = ["New", "Onboarded", "Inactive"];

export type MerchantFormFields = {
  merchant_name: string;
  industry?: string;
  contact_person?: string;
  contact_email?: string;
  phone_number?: string;
  status: string;
};

export default function NewMerchantDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSubmit: (data: MerchantFormFields) => void;
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MerchantFormFields>({
    defaultValues: {
      status: "New",
    }
  });

  const handleFormSubmit = async (data: MerchantFormFields) => {
    setLoading(true);
    await onSubmit(data);
    setLoading(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-card">
        <DialogHeader>
          <DialogTitle>Add New Merchant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-primary-foreground">
              Merchant Name <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("merchant_name", { required: "Merchant Name is required" })}
              placeholder="Enter merchant name"
              className="bg-background"
            />
            {errors.merchant_name && <span className="text-destructive text-xs">{errors.merchant_name.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-primary-foreground">
              Industry
            </label>
            <Input
              {...register("industry")}
              placeholder="Enter industry"
              className="bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-primary-foreground">
              Contact Person
            </label>
            <Input
              {...register("contact_person")}
              placeholder="Enter contact person"
              className="bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-primary-foreground">
              Contact Email
            </label>
            <Input
              type="email"
              {...register("contact_email", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address"
                }
              })}
              placeholder="Enter contact email"
              className="bg-background"
            />
            {errors.contact_email && <span className="text-destructive text-xs">{errors.contact_email.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-primary-foreground">
              Phone Number
            </label>
            <Input
              {...register("phone_number")}
              placeholder="Enter phone number"
              className="bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-primary-foreground">
              Status <span className="text-destructive">*</span>
            </label>
            <select
              {...register("status", { required: "Status is required" })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {statusOptions.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </select>
            {errors.status && <span className="text-destructive text-xs">{errors.status.message}</span>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Merchant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
