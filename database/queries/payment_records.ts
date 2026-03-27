import { supabase } from "@/lib/supabaseClient";
import type { PaymentRecordRow, PaymentRecord, PaymentRecordFormInput } from "@/database/types";

export async function getPaymentRecords(): Promise<PaymentRecordRow[]> {
  const { data, error } = await supabase
    .from("payment_records")
    .select(`
      *,
      status:payment_statuses(id, label, color),
      load:loads(title)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentRecordRow[];
}

export async function createPaymentRecord(
  input: PaymentRecordFormInput,
  userId: string
): Promise<PaymentRecord> {
  const { data, error } = await supabase
    .from("payment_records")
    .insert({
      name: input.name.trim(),
      description: input.description.trim() || null,
      amount: input.amount ? parseFloat(input.amount) : null,
      status_id: input.status_id,
      load_id: input.load_id || null,
      company_name: input.company_name.trim() || null,
      category: input.category,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PaymentRecord;
}

export async function updatePaymentRecord(
  id: string,
  input: PaymentRecordFormInput
): Promise<PaymentRecord> {
  const { data, error } = await supabase
    .from("payment_records")
    .update({
      name: input.name.trim(),
      description: input.description.trim() || null,
      amount: input.amount ? parseFloat(input.amount) : null,
      status_id: input.status_id,
      load_id: input.load_id || null,
      company_name: input.company_name.trim() || null,
      category: input.category,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PaymentRecord;
}

export async function deletePaymentRecord(id: string): Promise<void> {
  const { error } = await supabase.from("payment_records").delete().eq("id", id);
  if (error) throw error;
}
