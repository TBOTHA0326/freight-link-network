import { supabase } from "@/lib/supabaseClient";
import type { PaymentStatus } from "@/database/types";

export async function getPaymentStatuses(): Promise<PaymentStatus[]> {
  const { data, error } = await supabase
    .from("payment_statuses")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PaymentStatus[];
}

export async function createPaymentStatus(label: string, color: string): Promise<PaymentStatus> {
  const { data: existing } = await supabase
    .from("payment_statuses")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = existing ? existing.sort_order + 1 : 0;
  const { data, error } = await supabase
    .from("payment_statuses")
    .insert({ label, color, sort_order: nextOrder })
    .select()
    .single();
  if (error) throw error;
  return data as PaymentStatus;
}

export async function updatePaymentStatus(
  id: string,
  updates: Partial<Pick<PaymentStatus, "label" | "color" | "sort_order">>
): Promise<PaymentStatus> {
  const { data, error } = await supabase
    .from("payment_statuses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PaymentStatus;
}

export async function deletePaymentStatus(id: string): Promise<void> {
  const { error } = await supabase
    .from("payment_statuses")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getPaymentRecordCountForStatus(statusId: string): Promise<number> {
  const { count, error } = await supabase
    .from("payment_records")
    .select("id", { count: "exact", head: true })
    .eq("status_id", statusId);
  if (error) throw error;
  return count ?? 0;
}

// Swap sort_order between two adjacent statuses for ↑/↓ reordering.
// Pass the full sorted statuses array so we can find the neighbour.
export async function swapPaymentStatusOrder(
  id: string,
  direction: "up" | "down",
  statuses: PaymentStatus[]
): Promise<void> {
  const index = statuses.findIndex((s) => s.id === id);
  if (index === -1) return;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= statuses.length) return;
  const current = statuses[index];
  const target = statuses[targetIndex];
  await Promise.all([
    supabase.from("payment_statuses").update({ sort_order: target.sort_order }).eq("id", current.id),
    supabase.from("payment_statuses").update({ sort_order: current.sort_order }).eq("id", target.id),
  ]);
}
