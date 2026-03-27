import { supabase } from "@/lib/supabaseClient";

export interface TruckPack {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export async function getTruckPacks(companyId: string): Promise<TruckPack[]> {
  const { data, error } = await supabase
    .from("truck_packs")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TruckPack[];
}

export async function uploadTruckPack(
  companyId: string,
  name: string,
  description: string | null,
  file: File,
  userId: string
): Promise<TruckPack> {
  const ext = file.name.split(".").pop();
  const uuid = crypto.randomUUID();
  const filePath = `${companyId}/truck_pack/${uuid}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("truck_packs")
    .insert({
      company_id: companyId,
      name,
      description: description || null,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      uploaded_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TruckPack;
}

export async function deleteTruckPack(packId: string, filePath: string): Promise<void> {
  await supabase.storage.from("documents").remove([filePath]);
  const { error } = await supabase.from("truck_packs").delete().eq("id", packId);
  if (error) throw error;
}

export async function getTruckPackUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 3600);
  if (error) return null;
  return data.signedUrl;
}
