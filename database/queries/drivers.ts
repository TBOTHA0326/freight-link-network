import { supabase } from "@/lib/supabaseClient";
import type { Driver, DriverFormInput } from "@/database/types";

export async function getDrivers(companyId: string): Promise<Driver[]> {
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Driver[];
}

export async function createDriver(
  input: DriverFormInput,
  companyId: string,
  userId: string
): Promise<Driver> {
  const { data, error } = await supabase
    .from("drivers")
    .insert({
      company_id: companyId,
      first_name: input.first_name,
      last_name: input.last_name,
      id_number: input.id_number || null,
      license_number: input.license_number || null,
      license_expiry: input.license_expiry || null,
      phone: input.phone || null,
      email: input.email || null,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Driver;
}

export async function updateDriver(
  driverId: string,
  input: Partial<DriverFormInput>
): Promise<Driver> {
  const updates: Record<string, unknown> = {};
  if (input.first_name) updates.first_name = input.first_name;
  if (input.last_name) updates.last_name = input.last_name;
  if (input.id_number !== undefined) updates.id_number = input.id_number || null;
  if (input.license_number !== undefined) updates.license_number = input.license_number || null;
  if (input.license_expiry !== undefined) updates.license_expiry = input.license_expiry || null;
  if (input.phone !== undefined) updates.phone = input.phone || null;
  if (input.email !== undefined) updates.email = input.email || null;

  const { data, error } = await supabase
    .from("drivers")
    .update(updates)
    .eq("id", driverId)
    .select()
    .single();
  if (error) throw error;
  return data as Driver;
}

export async function deleteDriver(driverId: string): Promise<void> {
  const { error } = await supabase.from("drivers").delete().eq("id", driverId);
  if (error) throw error;
}
