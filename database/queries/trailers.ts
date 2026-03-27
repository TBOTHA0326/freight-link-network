import { supabase } from "@/lib/supabaseClient";
import type { Trailer, TrailerFormInput } from "@/database/types";

export async function getTrailers(companyId: string): Promise<Trailer[]> {
  const { data, error } = await supabase
    .from("trailers")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Trailer[];
}

export async function createTrailer(
  input: TrailerFormInput,
  companyId: string,
  userId: string
): Promise<Trailer> {
  const { data, error } = await supabase
    .from("trailers")
    .insert({
      company_id: companyId,
      registration_number: input.registration_number,
      trailer_type: input.trailer_type,
      make: input.make || null,
      model: input.model || null,
      year: input.year ? parseInt(input.year) : null,
      length_meters: input.length_meters ? parseFloat(input.length_meters) : null,
      payload_capacity_tons: input.payload_capacity_tons ? parseFloat(input.payload_capacity_tons) : null,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Trailer;
}

export async function updateTrailer(
  trailerId: string,
  input: Partial<TrailerFormInput>
): Promise<Trailer> {
  const updates: Record<string, unknown> = {};
  if (input.registration_number) updates.registration_number = input.registration_number;
  if (input.trailer_type) updates.trailer_type = input.trailer_type;
  if (input.make !== undefined) updates.make = input.make || null;
  if (input.model !== undefined) updates.model = input.model || null;
  if (input.year !== undefined) updates.year = input.year ? parseInt(input.year) : null;
  if (input.length_meters !== undefined) updates.length_meters = input.length_meters ? parseFloat(input.length_meters) : null;
  if (input.payload_capacity_tons !== undefined) updates.payload_capacity_tons = input.payload_capacity_tons ? parseFloat(input.payload_capacity_tons) : null;

  const { data, error } = await supabase
    .from("trailers")
    .update(updates)
    .eq("id", trailerId)
    .select()
    .single();
  if (error) throw error;
  return data as Trailer;
}

export async function deleteTrailer(trailerId: string): Promise<void> {
  const { error } = await supabase.from("trailers").delete().eq("id", trailerId);
  if (error) throw error;
}
