import { supabase } from "@/lib/supabaseClient";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

export interface ContactFormInput {
  name: string;
  email: string;
  company?: string;
  role?: string;
  message: string;
}

export async function createContactSubmission(input: ContactFormInput): Promise<void> {
  const { error } = await supabase.from("contact_submissions").insert({
    name: input.name,
    email: input.email,
    company: input.company || null,
    role: input.role || null,
    message: input.message,
  });
  if (error) throw error;
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateContactStatus(
  id: string,
  status: "new" | "read" | "replied"
): Promise<void> {
  const { error } = await supabase
    .from("contact_submissions")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteContactSubmission(id: string): Promise<void> {
  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
