import { supabase } from "@/lib/supabaseClient";
import type { Truck, TruckFormInput } from "@/database/types";

export async function getTrucks(companyId: string): Promise<Truck[]> {
  const { data, error } = await supabase
    .from("trucks")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Truck[];
}

export async function createTruck(
  input: TruckFormInput,
  companyId: string,
  userId: string
): Promise<Truck> {
  const { data, error } = await supabase
    .from("trucks")
    .insert({
      company_id: companyId,
      registration_number: input.registration_number,
      make: input.make || null,
      model: input.model || null,
      year: input.year ? parseInt(input.year) : null,
      horse_type: input.horse_type || null,
      number_of_axles: input.number_of_axles ? parseInt(input.number_of_axles) : null,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Truck;
}

export async function updateTruck(
  truckId: string,
  input: Partial<TruckFormInput>
): Promise<Truck> {
  const updates: Record<string, unknown> = {};
  if (input.registration_number) updates.registration_number = input.registration_number;
  if (input.make !== undefined) updates.make = input.make || null;
  if (input.model !== undefined) updates.model = input.model || null;
  if (input.year !== undefined) updates.year = input.year ? parseInt(input.year) : null;
  if (input.horse_type !== undefined) updates.horse_type = input.horse_type || null;
  if (input.number_of_axles !== undefined) updates.number_of_axles = input.number_of_axles ? parseInt(input.number_of_axles) : null;

  const { data, error } = await supabase
    .from("trucks")
    .update(updates)
    .eq("id", truckId)
    .select()
    .single();
  if (error) throw error;
  return data as Truck;
}

export async function deleteTruck(truckId: string): Promise<void> {
  const { error } = await supabase.from("trucks").delete().eq("id", truckId);
  if (error) throw error;
}
