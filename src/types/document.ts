export interface Document {
  id: string;
  name: string;
  path?: string;
  type: 'file' | 'folder';
  project_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  url?: string;
  children?: Document[];
} 