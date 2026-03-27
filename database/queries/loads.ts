import { supabase } from "@/lib/supabaseClient";
import type { Load, LoadFormInput, LoadStatus, MapLoad } from "@/database/types";

export async function getLoads(filters?: { status?: LoadStatus; company_id?: string }): Promise<Load[]> {
  let query = supabase.from("loads").select("*").order("created_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.company_id) query = query.eq("company_id", filters.company_id);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Load[];
}

export async function getLoadById(loadId: string): Promise<Load | null> {
  const { data, error } = await supabase
    .from("loads")
    .select("*")
    .eq("id", loadId)
    .single();
  if (error) return null;
  return data as Load;
}

export async function getLoadsByCompany(companyId: string): Promise<Load[]> {
  const { data, error } = await supabase
    .from("loads")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Load[];
}

export async function getApprovedLoads(): Promise<Load[]> {
  const { data, error } = await supabase
    .from("loads")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Load[];
}

export async function createLoad(input: LoadFormInput, companyId: string | undefined | null, userId: string): Promise<Load> {
  const { data, error } = await supabase
    .from("loads")
    .insert({
      company_id: companyId ?? null,
      title: input.title,
      description: input.description || null,
      cargo_type: input.cargo_type || null,
      weight_tons: input.weight_tons ? parseFloat(input.weight_tons) : null,
      contact_phone: input.contact_phone || null,
      internal_notes: input.internal_notes || null,
      pickup_address: input.pickup_address || null,
      pickup_city: input.pickup_city || null,
      pickup_province: input.pickup_province || null,
      pickup_country: input.pickup_country || null,
      pickup_lat: input.pickup_lat,
      pickup_lng: input.pickup_lng,
      pickup_place_id: input.pickup_place_id || null,
      pickup_date: input.pickup_date || null,
      pickup_time_window: input.pickup_time_window || null,
      delivery_address: input.delivery_address || null,
      delivery_city: input.delivery_city || null,
      delivery_province: input.delivery_province || null,
      delivery_country: input.delivery_country || null,
      delivery_lat: input.delivery_lat,
      delivery_lng: input.delivery_lng,
      delivery_place_id: input.delivery_place_id || null,
      delivery_date: input.delivery_date || null,
      delivery_time_window: input.delivery_time_window || null,
      required_trailer_type: input.required_trailer_type.length > 0 ? input.required_trailer_type : null,
      budget_amount: input.budget_amount ? parseFloat(input.budget_amount) : null,
      special_instructions: input.special_instructions || null,
      is_hazardous: input.is_hazardous,
      is_cross_border: input.is_cross_border,
      status: "pending",
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Load;
}

export async function updateLoad(loadId: string, input: Partial<LoadFormInput>): Promise<Load> {
  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description || null;
  if (input.cargo_type !== undefined) updates.cargo_type = input.cargo_type || null;
  if (input.weight_tons !== undefined) updates.weight_tons = input.weight_tons ? parseFloat(input.weight_tons) : null;
  if (input.contact_phone !== undefined) updates.contact_phone = input.contact_phone || null;
  if (input.internal_notes !== undefined) updates.internal_notes = input.internal_notes || null;
  if (input.pickup_address !== undefined) updates.pickup_address = input.pickup_address;
  if (input.pickup_city !== undefined) updates.pickup_city = input.pickup_city;
  if (input.pickup_province !== undefined) updates.pickup_province = input.pickup_province;
  if (input.pickup_country !== undefined) updates.pickup_country = input.pickup_country;
  if (input.pickup_lat !== undefined) updates.pickup_lat = input.pickup_lat;
  if (input.pickup_lng !== undefined) updates.pickup_lng = input.pickup_lng;
  if (input.pickup_date !== undefined) updates.pickup_date = input.pickup_date || null;
  if (input.delivery_address !== undefined) updates.delivery_address = input.delivery_address;
  if (input.delivery_city !== undefined) updates.delivery_city = input.delivery_city;
  if (input.delivery_province !== undefined) updates.delivery_province = input.delivery_province;
  if (input.delivery_country !== undefined) updates.delivery_country = input.delivery_country;
  if (input.delivery_lat !== undefined) updates.delivery_lat = input.delivery_lat;
  if (input.delivery_lng !== undefined) updates.delivery_lng = input.delivery_lng;
  if (input.delivery_date !== undefined) updates.delivery_date = input.delivery_date || null;
  if (input.required_trailer_type !== undefined) updates.required_trailer_type = input.required_trailer_type.length > 0 ? input.required_trailer_type : null;
  if (input.budget_amount !== undefined) updates.budget_amount = input.budget_amount ? parseFloat(input.budget_amount) : null;
  if (input.special_instructions !== undefined) updates.special_instructions = input.special_instructions || null;
  if (input.is_hazardous !== undefined) updates.is_hazardous = input.is_hazardous;
  if (input.is_cross_border !== undefined) updates.is_cross_border = input.is_cross_border;

  const { data, error } = await supabase
    .from("loads")
    .update(updates)
    .eq("id", loadId)
    .select()
    .single();
  if (error) throw error;
  return data as Load;
}

export async function createInTransitLoad(title: string, description: string | null, userId: string): Promise<Load> {
  const { data, error } = await supabase
    .from("loads")
    .insert({ title, description, status: "in_transit", created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Load;
}

export async function deleteLoad(loadId: string): Promise<void> {
  const { error } = await supabase.from("loads").delete().eq("id", loadId);
  if (error) throw error;
}

export async function getMapLoads(
  userRole: string,
  userCompanyId?: string
): Promise<MapLoad[]> {
  const { data, error } = await supabase.rpc("get_map_loads", {
    user_role_param: userRole,
    user_company_id: userCompanyId ?? null,
  });
  if (error) throw error;
  return (data ?? []) as MapLoad[];
}
