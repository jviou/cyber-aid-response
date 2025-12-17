// No Supabase - local only

import { generateSessionId } from "./stateStore";

export interface ResourceFile {
  id: string;
  session_id: string;
  title: string;
  blob_key?: string;
  size_bytes: number | null;
  added_at: string;
  mime_type?: string;
}

export async function ensureSessionExists(sessionId: string): Promise<void> {
  // Local only - no backend check needed
}

export async function uploadFile(file: File, sessionId: string): Promise<ResourceFile> {
  // Local storage using base64
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const resource: ResourceFile = {
        id: generateSessionId(),
        session_id: sessionId,
        title: file.name,
        blob_key: reader.result as string,
        size_bytes: file.size,
        added_at: new Date().toISOString(),
        mime_type: file.type
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('resources') || '[]');
      existing.push(resource);
      localStorage.setItem('resources', JSON.stringify(existing));

      resolve(resource);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function listFiles(sessionId: string): Promise<ResourceFile[]> {
  const resources = JSON.parse(localStorage.getItem('resources') || '[]');
  return resources.filter((r: ResourceFile) => r.session_id === sessionId);
}

export async function deleteFile(id: string): Promise<void> {
  const resources = JSON.parse(localStorage.getItem('resources') || '[]');
  const filtered = resources.filter((r: ResourceFile) => r.id !== id);
  localStorage.setItem('resources', JSON.stringify(filtered));
}

// ... (existing code)

export async function saveLink(url: string, sessionId: string): Promise<ResourceFile> {
  const resource: ResourceFile = {
    id: generateSessionId(),
    session_id: sessionId,
    title: url,
    blob_key: url,
    size_bytes: null,
    added_at: new Date().toISOString(),
    mime_type: 'application/x-url'
  };

  const existing = JSON.parse(localStorage.getItem('resources') || '[]');
  existing.push(resource);
  localStorage.setItem('resources', JSON.stringify(existing));

  return resource;
}

export async function getFileUrl(blobKey: string): Promise<string> {
  // Return the base64 data URL directly
  return blobKey;
}