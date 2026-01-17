// =============================================
// DRIVERS QUERIES - Supabase Drivers Table
// =============================================

import { createClient } from '@/lib/supabaseClient';
import type { 
  Driver, 
  DriverFormInput, 
  DriverWithDocuments,
  Document 
} from '../types';

// Create a new driver
export async function createDriver(
  companyId: string,
  input: DriverFormInput
): Promise<Driver> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('drivers')
    .insert({
      company_id: companyId,
      ...input,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

// Get drivers by company ID
export async function getDriversByCompany(companyId: string): Promise<Driver[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Driver[];
}

// Get driver by ID
export async function getDriverById(driverId: string): Promise<Driver | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', driverId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Driver;
}

// Get driver with documents
export async function getDriverWithDocuments(
  driverId: string
): Promise<DriverWithDocuments | null> {
  const supabase = createClient();
  
  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', driverId)
    .single();

  if (driverError) {
    if (driverError.code === 'PGRST116') return null;
    throw driverError;
  }

  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select('*')
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false });

  if (docsError) throw docsError;

  return {
    ...driver,
    documents: documents as Document[],
  } as DriverWithDocuments;
}

// Get all drivers with documents for a company
export async function getDriversWithDocumentsByCompany(
  companyId: string
): Promise<DriverWithDocuments[]> {
  const supabase = createClient();
  
  const { data: drivers, error: driversError } = await supabase
    .from('drivers')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (driversError) throw driversError;

  const driversWithDocs = await Promise.all(
    (drivers as Driver[]).map(async (driver) => {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false });

      return {
        ...driver,
        documents: (documents || []) as Document[],
      } as DriverWithDocuments;
    })
  );

  return driversWithDocs;
}

// Update driver
export async function updateDriver(
  driverId: string,
  updates: Partial<DriverFormInput>
): Promise<Driver> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('drivers')
    .update(updates)
    .eq('id', driverId)
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

// Delete driver
export async function deleteDriver(driverId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('drivers')
    .delete()
    .eq('id', driverId);

  if (error) throw error;
}

// Verify driver (admin only)
export async function verifyDriver(
  driverId: string,
  isVerified: boolean
): Promise<Driver> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('drivers')
    .update({ is_verified: isVerified })
    .eq('id', driverId)
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

// Toggle driver active status
export async function toggleDriverActive(
  driverId: string,
  isActive: boolean
): Promise<Driver> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('drivers')
    .update({ is_active: isActive })
    .eq('id', driverId)
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

// Get all drivers (admin only)
export async function getAllDrivers(): Promise<Driver[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Driver[];
}

// Search drivers by name or ID number
export async function searchDrivers(
  companyId: string,
  searchTerm: string
): Promise<Driver[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('company_id', companyId)
    .or(`full_name.ilike.%${searchTerm}%,surname.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Driver[];
}
