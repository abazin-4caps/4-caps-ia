export type Document = {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  project_id: string
  parent_id?: string
  created_at: string
  updated_at: string
  children?: Document[]
} 