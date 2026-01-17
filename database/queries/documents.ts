// =============================================
// DOCUMENTS QUERIES - Supabase Documents Table & Storage
// =============================================

import { createClient } from '@/lib/supabaseClient';
import type { 
  Document, 
  DocumentCategory, 
  DocumentStatus,
  DocumentUploadInput 
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// Upload a document file to storage and create record
export async function uploadDocument(
  input: DocumentUploadInput
): Promise<Document> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Generate unique file path
  const fileExt = input.file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${input.company_id}/${input.category}/${fileName}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, input.file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Create document record
  const { data, error } = await supabase
    .from('documents')
    .insert({
      company_id: input.company_id,
      truck_id: input.truck_id || null,
      trailer_id: input.trailer_id || null,
      driver_id: input.driver_id || null,
      category: input.category,
      title: input.title,
      file_path: filePath,
      file_name: input.file.name,
      file_size: input.file.size,
      mime_type: input.file.type,
      status: 'pending',
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}

// Get documents by company ID
export async function getDocumentsByCompany(
  companyId: string,
  category?: DocumentCategory
): Promise<Document[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('documents')
    .select('*')
    .eq('company_id', companyId)
    .is('truck_id', null)
    .is('trailer_id', null)
    .is('driver_id', null)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Document[];
}

// Get documents by truck ID
export async function getDocumentsByTruck(truckId: string): Promise<Document[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('truck_id', truckId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Document[];
}

// Get documents by trailer ID
export async function getDocumentsByTrailer(trailerId: string): Promise<Document[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('trailer_id', trailerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Document[];
}

// Get documents by driver ID
export async function getDocumentsByDriver(driverId: string): Promise<Document[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Document[];
}

// Get document by ID
export async function getDocumentById(documentId: string): Promise<Document | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Document;
}

// Get document download URL
export async function getDocumentUrl(filePath: string): Promise<string> {
  const supabase = createClient();
  
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (!data?.signedUrl) throw new Error('Failed to generate download URL');
  return data.signedUrl;
}

// Update document metadata
export async function updateDocument(
  documentId: string,
  updates: Partial<Pick<Document, 'title'>>
): Promise<Document> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}

// Delete document (and file from storage)
export async function deleteDocument(documentId: string): Promise<void> {
  const supabase = createClient();
  
  // First get the document to get the file path
  const { data: document } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', documentId)
    .single();

  if (document?.file_path) {
    // Delete from storage
    await supabase.storage
      .from('documents')
      .remove([document.file_path]);
  }

  // Delete record
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
}

// Review document (admin only)
export async function reviewDocument(
  documentId: string,
  status: DocumentStatus,
  rejectionReason?: string
): Promise<Document> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('review_document', {
    doc_id: documentId,
    new_status: status,
    reason: rejectionReason || null,
  });

  if (error) throw error;
  return data as Document;
}

// Get all pending documents (admin only)
export async function getPendingDocuments(): Promise<Document[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Document[];
}

// Get documents with company info (for admin approvals)
export async function getDocumentsWithCompanyInfo(): Promise<Array<Document & { company_name: string }>> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      companies:company_id (name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map((doc: Document & { companies: { name: string } }) => ({
    ...doc,
    company_name: doc.companies?.name || 'Unknown',
  })) as Array<Document & { company_name: string }>;
}
