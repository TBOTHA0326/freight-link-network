import { supabase } from "@/lib/supabaseClient";

export interface FinanceCategory {
  id: string;
  label: string;
  sort_order: number;
  created_at: string;
}

export async function getFinanceCategories(): Promise<FinanceCategory[]> {
  const { data, error } = await supabase
    .from("finance_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FinanceCategory[];
}

export async function createFinanceCategory(label: string): Promise<FinanceCategory> {
  const { data: existing } = await supabase
    .from("finance_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const nextOrder = existing ? (existing.sort_order as number) + 1 : 1;

  const { data, error } = await supabase
    .from("finance_categories")
    .insert({ label, sort_order: nextOrder })
    .select()
    .single();
  if (error) throw error;
  return data as FinanceCategory;
}

export async function deleteFinanceCategory(id: string): Promise<void> {
  const { error } = await supabase.from("finance_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function swapFinanceCategoryOrder(
  id: string,
  direction: "up" | "down",
  categories: FinanceCategory[]
): Promise<void> {
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= categories.length) return;

  const a = categories[idx];
  const b = categories[swapIdx];

  await Promise.all([
    supabase.from("finance_categories").update({ sort_order: b.sort_order }).eq("id", a.id),
    supabase.from("finance_categories").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);
}
