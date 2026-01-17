// =============================================
// TRAILERS QUERIES - Supabase Trailers Table
// =============================================

import { createClient } from '@/lib/supabaseClient';
import type { 
  Trailer, 
  TrailerFormInput, 
  TrailerWithDocuments,
  Document 
} from '../types';

// Create a new trailer
export async function createTrailer(
  companyId: string,
  input: TrailerFormInput
): Promise<Trailer> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('trailers')
    .insert({
      company_id: companyId,
      ...input,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Trailer;
}

// Get trailers by company ID
export async function getTrailersByCompany(companyId: string): Promise<Trailer[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trailers')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Trailer[];
}

// Get trailer by ID
export async function getTrailerById(trailerId: string): Promise<Trailer | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trailers')
    .select('*')
    .eq('id', trailerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Trailer;
}

// Get trailer with documents
export async function getTrailerWithDocuments(
  trailerId: string
): Promise<TrailerWithDocuments | null> {
  const supabase = createClient();
  
  const { data: trailer, error: trailerError } = await supabase
    .from('trailers')
    .select('*')
    .eq('id', trailerId)
    .single();

  if (trailerError) {
    if (trailerError.code === 'PGRST116') return null;
    throw trailerError;
  }

  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select('*')
    .eq('trailer_id', trailerId)
    .order('created_at', { ascending: false });

  if (docsError) throw docsError;

  return {
    ...trailer,
    documents: documents as Document[],
  } as TrailerWithDocuments;
}

// Get all trailers with documents for a company
export async function getTrailersWithDocumentsByCompany(
  companyId: string
): Promise<TrailerWithDocuments[]> {
  const supabase = createClient();
  
  const { data: trailers, error: trailersError } = await supabase
    .from('trailers')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (trailersError) throw trailersError;

  const trailersWithDocs = await Promise.all(
    (trailers as Trailer[]).map(async (trailer) => {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('trailer_id', trailer.id)
        .order('created_at', { ascending: false });

      return {
        ...trailer,
        documents: (documents || []) as Document[],
      } as TrailerWithDocuments;
    })
  );

  return trailersWithDocs;
}

// Update trailer
export async function updateTrailer(
  trailerId: string,
  updates: Partial<TrailerFormInput>
): Promise<Trailer> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trailers')
    .update(updates)
    .eq('id', trailerId)
    .select()
    .single();

  if (error) throw error;
  return data as Trailer;
}

// Delete trailer
export async function deleteTrailer(trailerId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('trailers')
    .delete()
    .eq('id', trailerId);

  if (error) throw error;
}

// Verify trailer (admin only)
export async function verifyTrailer(
  trailerId: string,
  isVerified: boolean
): Promise<Trailer> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trailers')
    .update({ is_verified: isVerified })
    .eq('id', trailerId)
    .select()
    .single();

  if (error) throw error;
  return data as Trailer;
}

// Toggle trailer active status
export async function toggleTrailerActive(
  trailerId: string,
  isActive: boolean
): Promise<Trailer> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trailers')
    .update({ is_active: isActive })
    .eq('id', trailerId)
    .select()
    .single();

  if (error) throw error;
  return data as Trailer;
}

// Get all trailers (admin only)
export async function getAllTrailers(): Promise<Trailer[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('trailers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Trailer[];
}
