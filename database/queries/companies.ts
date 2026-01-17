// =============================================
// COMPANIES QUERIES - Supabase Companies Table
// =============================================

import { createClient } from '@/lib/supabaseClient';
import type { 
  Company, 
  CompanyFormInput, 
  CompanyWithDetails,
  UserRole,
  DashboardStats 
} from '../types';

// Create a new company
export async function createCompany(
  input: CompanyFormInput,
  companyType: UserRole
): Promise<Company> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('companies')
    .insert({
      ...input,
      company_type: companyType,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Update user's profile with company_id
  await supabase
    .from('profiles')
    .update({ company_id: data.id })
    .eq('id', user.id);

  return data as Company;
}

// Get company by ID
export async function getCompanyById(companyId: string): Promise<Company | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Company;
}

// Get current user's company
export async function getCurrentUserCompany(): Promise<Company | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // First get the user's profile to find their company_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return null;

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Company;
}

// Update company
export async function updateCompany(
  companyId: string,
  updates: Partial<CompanyFormInput>
): Promise<Company> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

// Get all companies (admin only)
export async function getAllCompanies(
  companyType?: UserRole
): Promise<Company[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (companyType) {
    query = query.eq('company_type', companyType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Company[];
}

// Get all transporters (admin only)
export async function getAllTransporters(): Promise<Company[]> {
  return getAllCompanies('transporter');
}

// Get all suppliers (admin only)
export async function getAllSuppliers(): Promise<Company[]> {
  return getAllCompanies('supplier');
}

// Get company with full details (including trucks, trailers, drivers, documents)
export async function getCompanyFullDetails(
  companyId: string
): Promise<CompanyWithDetails | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('get_company_full_details', {
    company_uuid: companyId,
  });

  if (error) throw error;
  return data as CompanyWithDetails;
}

// Verify company (admin only)
export async function verifyCompany(
  companyId: string,
  isVerified: boolean
): Promise<Company> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('companies')
    .update({ is_verified: isVerified })
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

// Search companies
export async function searchCompanies(
  searchTerm: string,
  companyType?: UserRole
): Promise<Company[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('companies')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,registration_number.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (companyType) {
    query = query.eq('company_type', companyType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Company[];
}

// Get admin dashboard stats
export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

  if (error) throw error;
  return data as DashboardStats;
}

// Delete company (admin only)
export async function deleteCompany(companyId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (error) throw error;
}
