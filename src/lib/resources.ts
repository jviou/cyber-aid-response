import { supabase } from '@/integrations/supabase/client';

export interface ResourceFile {
  id: string;
  session_id: string;
  title: string;
  blob_key?: string;
  size_bytes: number | null;
  added_at: string;
  mime_type?: string;
}

async function ensureSessionExists(sessionId: string) {
  const { data } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', sessionId)
    .maybeSingle();
  if (!data) {
    await supabase.from('sessions').insert({
      id: sessionId,
      title: 'Local Session',
      mode: 'exercise',
      severity: 'moderate'
    } as any);
  }
}

export async function uploadFile(file: File, sessionId: string): Promise<ResourceFile> {
  try {
    // Ensure session exists to satisfy FK
    await ensureSessionExists(sessionId);

    // Generate unique filename
    const fileId = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}-${file.name}`;
    const filePath = `${sessionId}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Insert metadata into resources table
    const { data, error } = await supabase
      .from('resources')
      .insert({
        session_id: sessionId,
        kind: 'file',
        title: file.name,
        blob_key: filePath,
        mime_type: file.type,
        size_bytes: file.size
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('resources').remove([filePath]);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function listFiles(sessionId: string): Promise<ResourceFile[]> {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('session_id', sessionId)
      .order('added_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

export async function deleteFile(id: string): Promise<void> {
  try {
    // Get file path first
    const { data: resource, error: selectError } = await supabase
      .from('resources')
      .select('blob_key')
      .eq('id', id)
      .single();

    if (selectError) {
      throw selectError;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('resources')
      .remove([resource.blob_key]);

    if (storageError) {
      console.warn('Error deleting from storage:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (dbError) {
      throw dbError;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function getFileUrl(blobKey: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('resources')
    .createSignedUrl(blobKey, 3600);
  if (error || !data?.signedUrl) {
    // Fallback to public URL if signing fails
    return supabase.storage.from('resources').getPublicUrl(blobKey).data.publicUrl;
  }
  return data.signedUrl;
}