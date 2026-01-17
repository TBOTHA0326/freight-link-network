// =============================================
// TRUCKS QUERIES - Supabase Trucks Table
// =============================================

import { createClient } from '@/lib/supabaseClient';
import type { 
  Truck, 
  TruckFormInput, 
  TruckWithDocuments,
  Document 
} from '../types';

// Create a new truck
export async function createTruck(
  companyId: string,
  input: TruckFormInput
): Promise<Truck> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('trucks')
    .insert({
      company_id: companyId,
      ...input,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Truck;
}

// Get trucks by company ID
export async function getTrucksByCompany(companyId: string): Promise<Truck[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trucks')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Truck[];
}

// Get truck by ID
export async function getTruckById(truckId: string): Promise<Truck | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trucks')
    .select('*')
    .eq('id', truckId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Truck;
}

// Get truck with documents
export async function getTruckWithDocuments(
  truckId: string
): Promise<TruckWithDocuments | null> {
  const supabase = createClient();
  
  const { data: truck, error: truckError } = await supabase
    .from('trucks')
    .select('*')
    .eq('id', truckId)
    .single();

  if (truckError) {
    if (truckError.code === 'PGRST116') return null;
    throw truckError;
  }

  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select('*')
    .eq('truck_id', truckId)
    .order('created_at', { ascending: false });

  if (docsError) throw docsError;

  return {
    ...truck,
    documents: documents as Document[],
  } as TruckWithDocuments;
}

// Get all trucks with documents for a company
export async function getTrucksWithDocumentsByCompany(
  companyId: string
): Promise<TruckWithDocuments[]> {
  const supabase = createClient();
  
  const { data: trucks, error: trucksError } = await supabase
    .from('trucks')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (trucksError) throw trucksError;

  const trucksWithDocs = await Promise.all(
    (trucks as Truck[]).map(async (truck) => {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('truck_id', truck.id)
        .order('created_at', { ascending: false });

      return {
        ...truck,
        documents: (documents || []) as Document[],
      } as TruckWithDocuments;
    })
  );

  return trucksWithDocs;
}

// Update truck
export async function updateTruck(
  truckId: string,
  updates: Partial<TruckFormInput>
): Promise<Truck> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trucks')
    .update(updates)
    .eq('id', truckId)
    .select()
    .single();

  if (error) throw error;
  return data as Truck;
}

// Delete truck
export async function deleteTruck(truckId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('trucks')
    .delete()
    .eq('id', truckId);

  if (error) throw error;
}

// Verify truck (admin only)
export async function verifyTruck(
  truckId: string,
  isVerified: boolean
): Promise<Truck> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trucks')
    .update({ is_verified: isVerified })
    .eq('id', truckId)
    .select()
    .single();

  if (error) throw error;
  return data as Truck;
}

// Toggle truck active status
export async function toggleTruckActive(
  truckId: string,
  isActive: boolean
): Promise<Truck> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trucks')
    .update({ is_active: isActive })
    .eq('id', truckId)
    .select()
    .single();

  if (error) throw error;
  return data as Truck;
}

// Get all trucks (admin only)
export async function getAllTrucks(): Promise<Truck[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trucks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Truck[];
}
