import { supabase } from "@/lib/supabaseClient";
import type { DocumentRecord, DocumentCategory, DocumentStatus } from "@/database/types";

export async function getDocumentsByCompany(companyId: string): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRecord[];
}

export async function uploadDocument(
  companyId: string,
  category: DocumentCategory,
  title: string,
  file: File,
  userId: string,
  extra?: { truck_id?: string; trailer_id?: string; driver_id?: string }
): Promise<DocumentRecord> {
  const ext = file.name.split(".").pop();
  const uuid = crypto.randomUUID();
  const filePath = `${companyId}/${category}/${uuid}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("documents")
    .insert({
      company_id: companyId,
      category,
      title,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      status: "pending",
      uploaded_by: userId,
      truck_id: extra?.truck_id ?? null,
      trailer_id: extra?.trailer_id ?? null,
      driver_id: extra?.driver_id ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DocumentRecord;
}

export async function reviewDocument(
  docId: string,
  newStatus: DocumentStatus,
  reason?: string
): Promise<void> {
  await supabase.rpc("review_document", {
    doc_id: docId,
    new_status: newStatus,
    reason: reason ?? null,
  });
}

export async function getDocumentUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 3600);
  if (error) return null;
  return data.signedUrl;
}

export async function deleteDocument(docId: string, filePath: string): Promise<void> {
  await supabase.storage.from("documents").remove([filePath]);
  const { error } = await supabase.from("documents").delete().eq("id", docId);
  if (error) throw error;
}
