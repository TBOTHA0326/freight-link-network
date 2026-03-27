import { supabase } from "@/lib/supabaseClient";
import type { Company, CompanyFormInput } from "@/database/types";

export async function getCompany(companyId: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();
  if (error) return null;
  return data as Company;
}

export async function getCompanyWithOwner(companyId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();
  if (error) return null;
  return data;
}

export async function createCompany(
  input: CompanyFormInput,
  companyType: "transporter" | "supplier",
  userId: string
): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: input.name,
      registration_number: input.registration_number || null,
      tax_number: input.tax_number || null,
      address: input.address || null,
      city: input.city || null,
      province: input.province || null,
      postal_code: input.postal_code || null,
      country: input.country || "South Africa",
      phone: input.phone || null,
      email: input.email || null,
      website: input.website || null,
      company_type: companyType,
      does_cross_border: input.does_cross_border,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Company;
}

export async function updateCompany(
  companyId: string,
  updates: Partial<CompanyFormInput>
): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId)
    .select()
    .single();
  if (error) throw error;
  return data as Company;
}

export async function getAllCompanies(): Promise<Pick<Company, "id" | "name" | "company_type">[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, company_type")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Pick<Company, "id" | "name" | "company_type">[];
}
