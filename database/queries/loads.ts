// =============================================
// LOADS QUERIES - Supabase Loads Table
// =============================================

import { createClient } from '@/lib/supabaseClient';
import type { 
  Load, 
  LoadFormInput, 
  LoadStatus,
  LoadWithCompany,
  MapLoad,
  UserRole 
} from '../types';

// Create a new load
export async function createLoad(
  companyId: string,
  input: LoadFormInput
): Promise<Load> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('loads')
    .insert({
      company_id: companyId,
      ...input,
      status: 'pending',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Load;
}

// Get loads by company ID (for suppliers)
export async function getLoadsByCompany(companyId: string): Promise<Load[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Load[];
}

// Get approved loads (for transporters)
export async function getApprovedLoads(): Promise<LoadWithCompany[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .select(`
      *,
      companies:company_id (name)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map((load: Load & { companies: { name: string } }) => ({
    ...load,
    company_name: load.companies?.name || 'Unknown',
  })) as LoadWithCompany[];
}

// Get all loads (for admin)
export async function getAllLoads(): Promise<LoadWithCompany[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .select(`
      *,
      companies:company_id (name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map((load: Load & { companies: { name: string } }) => ({
    ...load,
    company_name: load.companies?.name || 'Unknown',
  })) as LoadWithCompany[];
}

// Get load by ID
export async function getLoadById(loadId: string): Promise<Load | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .select('*')
    .eq('id', loadId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Load;
}

// Get load with company info
export async function getLoadWithCompany(loadId: string): Promise<LoadWithCompany | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .select(`
      *,
      companies:company_id (name)
    `)
    .eq('id', loadId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  const loadData = data as Load & { companies: { name: string } };
  return {
    ...loadData,
    company_name: loadData.companies?.name || 'Unknown',
  } as LoadWithCompany;
}

// Update load
export async function updateLoad(
  loadId: string,
  updates: Partial<LoadFormInput>
): Promise<Load> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .update(updates)
    .eq('id', loadId)
    .select()
    .single();

  if (error) throw error;
  return data as Load;
}

// Delete load
export async function deleteLoad(loadId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('loads')
    .delete()
    .eq('id', loadId);

  if (error) throw error;
}

// Review load (admin only)
export async function reviewLoad(
  loadId: string,
  status: LoadStatus,
  rejectionReason?: string
): Promise<Load> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('review_load', {
    load_id: loadId,
    new_status: status,
    reason: rejectionReason || null,
  });

  if (error) throw error;
  return data as Load;
}

// Get pending loads (admin only)
export async function getPendingLoads(): Promise<LoadWithCompany[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .select(`
      *,
      companies:company_id (name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map((load: Load & { companies: { name: string } }) => ({
    ...load,
    company_name: load.companies?.name || 'Unknown',
  })) as LoadWithCompany[];
}

// Get loads for map display
export async function getMapLoads(
  userRole: UserRole,
  companyId?: string
): Promise<MapLoad[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('get_map_loads', {
    user_role_param: userRole,
    user_company_id: companyId || null,
  });

  if (error) throw error;
  return (data || []) as MapLoad[];
}

// Assign transporter to load (admin only)
export async function assignTransporterToLoad(
  loadId: string,
  transporterId: string,
  truckId?: string,
  driverId?: string
): Promise<Load> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .update({
      assigned_transporter_id: transporterId,
      assigned_truck_id: truckId || null,
      assigned_driver_id: driverId || null,
      status: 'in_transit',
    })
    .eq('id', loadId)
    .select()
    .single();

  if (error) throw error;
  return data as Load;
}

// Complete load
export async function completeLoad(loadId: string): Promise<Load> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .update({ status: 'completed' })
    .eq('id', loadId)
    .select()
    .single();

  if (error) throw error;
  return data as Load;
}

// Get loads by status
export async function getLoadsByStatus(status: LoadStatus): Promise<LoadWithCompany[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .select(`
      *,
      companies:company_id (name)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map((load: Load & { companies: { name: string } }) => ({
    ...load,
    company_name: load.companies?.name || 'Unknown',
  })) as LoadWithCompany[];
}

// Search loads
export async function searchLoads(searchTerm: string): Promise<LoadWithCompany[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loads')
    .select(`
      *,
      companies:company_id (name)
    `)
    .or(`title.ilike.%${searchTerm}%,pickup_city.ilike.%${searchTerm}%,delivery_city.ilike.%${searchTerm}%,cargo_type.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map((load: Load & { companies: { name: string } }) => ({
    ...load,
    company_name: load.companies?.name || 'Unknown',
  })) as LoadWithCompany[];
}

// Get approved loads for transporters (alias for consistency)
export async function getApprovedLoadsForTransporters(): Promise<LoadWithCompany[]> {
  return getApprovedLoads();
}

// Get loads for map display (simplified version without RPC)
export async function getLoadsForMap(
  status?: LoadStatus
): Promise<Load[]> {
  const supabase = createClient();
  
  let query = supabase.from('loads').select('*');
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as Load[];
}

// Update load status (for admin)
export async function updateLoadStatus(
  loadId: string,
  status: LoadStatus,
  rejectionReason?: string
): Promise<Load> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const updateData: Record<string, unknown> = {
    status,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };
  
  if (rejectionReason && status === 'rejected') {
    updateData.rejection_reason = rejectionReason;
  }

  const { data, error } = await supabase
    .from('loads')
    .update(updateData)
    .eq('id', loadId)
    .select()
    .single();

  if (error) throw error;
  return data as Load;
}
