
import { supabase } from "@/integrations/supabase/client";
import type { CsvRow } from "./csv-parse-utils";

// All fetching/inserting logic for leads table

export async function fetchUserLeads(userId: string, toast?: any): Promise<CsvRow[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("client_id", userId)
    .order("created_at", { ascending: false });

  if (error && toast) {
    toast({
      variant: "destructive",
      title: "Error loading your leads",
      description: error.message,
    });
    return [];
  }
  return (data ?? []).map((lead: any) => ({
    name: lead.name ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    source: lead.source ?? "",
    isValid: true,
    invalidReason: undefined,
    ...(lead.id && { id: lead.id }),
    ...(lead.status && { status: lead.status }),
    ...(lead.client_id && { client_id: lead.client_id }),
    ...(lead.created_at && { created_at: lead.created_at }),
  }));
}

/**
 * Insert a batch of leads (avoids duplicates for the user).
 */
export async function insertBatchLeads(
  leadsToInsert: any[],
  userId: string,
  selectedSource: string,
  batchSize: number = 50,
  toast?: any
): Promise<{ successCount: number; duplicateCount: number; dbError: string | null }> {
  let successCount = 0;
  let duplicateCount = 0;
  let dbError: string | null = null;

  for (let i = 0; i < leadsToInsert.length; i += batchSize) {
    const batch = leadsToInsert.slice(i, i + batchSize);

    for (const lead of batch) {
      // Check for duplicate by email or phone for this client
      const { data: existingLeads, error: checkError } = await supabase
        .from('leads')
        .select('id')
        .or(`email.eq.${lead.email},phone.eq.${lead.phone}`)
        .eq('client_id', userId)
        .limit(1);

      if (checkError) {
        dbError = checkError.message;
        continue;
      }
      if (existingLeads && existingLeads.length > 0) {
        duplicateCount++;
        continue;
      }
      // Only insert allowed fields
      const { error: insertError } = await supabase.from('leads').insert([lead]);
      if (insertError) {
        dbError = insertError.message;
      } else {
        successCount++;
      }
    }
  }
  return { successCount, duplicateCount, dbError };
}
