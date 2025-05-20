export type DocumentType = 'file' | 'folder';
export type FileType = 'image' | 'pdf' | 'office' | 'model' | 'other';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  project_id: string;
  parent_id: string | null;
  file_type?: FileType;
  path?: string;
  url?: string;
  urn?: string;  // Pour les fichiers convertis par Forge
  created_at: string;
  updated_at: string;
  children?: Document[];
} 