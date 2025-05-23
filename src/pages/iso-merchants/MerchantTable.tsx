
import { Loader2 } from "lucide-react";

type Merchant = {
  id: string;
  merchant_name: string;
  industry?: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  phone_number?: string | null;
  status: string;
  created_at: string;
};

const statusOptions = ["New", "Onboarded", "Inactive"];

export default function MerchantTable({
  merchants,
  loading,
  onStatusChange,
}: {
  merchants: Merchant[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  if (merchants.length === 0) {
    return null;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent text-base">
        <thead>
          <tr className="border-b border-muted-foreground">
            <th className="px-4 py-2 font-semibold text-left">Merchant Name</th>
            <th className="px-4 py-2 font-semibold text-left">Industry</th>
            <th className="px-4 py-2 font-semibold text-left">Contact Person</th>
            <th className="px-4 py-2 font-semibold text-left">Contact Email</th>
            <th className="px-4 py-2 font-semibold text-left">Phone Number</th>
            <th className="px-4 py-2 font-semibold text-left">Status</th>
            <th className="px-4 py-2 font-semibold text-left">Date Added</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((m) => (
            <tr key={m.id} className="hover:bg-accent/60 transition">
              <td className="px-4 py-3">{m.merchant_name}</td>
              <td className="px-4 py-3">{m.industry || <span className="text-muted-foreground">—</span>}</td>
              <td className="px-4 py-3">{m.contact_person || <span className="text-muted-foreground">—</span>}</td>
              <td className="px-4 py-3">{m.contact_email || <span className="text-muted-foreground">—</span>}</td>
              <td className="px-4 py-3">{m.phone_number || <span className="text-muted-foreground">—</span>}</td>
              <td className="px-4 py-3">
                <select
                  className="bg-muted rounded px-2 py-1 focus:ring-2 focus:ring-primary"
                  value={m.status}
                  onChange={(e) => onStatusChange(m.id, e.target.value)}
                  style={{minWidth: 110}}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">{new Date(m.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
