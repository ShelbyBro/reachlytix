
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";

const formFields = [
  { name: "merchant_name", label: "Merchant Name", required: true },
  { name: "industry", label: "Industry", required: false },
  { name: "contact_person", label: "Contact Person", required: false },
  { name: "contact_email", label: "Contact Email", required: false },
  { name: "phone_number", label: "Phone Number", required: false },
];

export default function NewMerchantDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSubmit: (data: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const handleFormSubmit = async (data: any) => {
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
          {formFields.map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1 text-primary-foreground">
                {f.label} {f.required ? <span className="text-destructive">*</span> : null}
              </label>
              <Input
                {...register(f.name, { required: !!f.required })}
                placeholder={`Enter ${f.label.toLowerCase()}`}
                className="bg-background"
              />
            </div>
          ))}
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
