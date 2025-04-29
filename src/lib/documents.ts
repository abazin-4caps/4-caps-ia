import { supabase } from "@/lib/supabase"
import { Document } from "@/types/document"

export async function getProjectDocuments(projectId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('path')

  if (error) throw error

  // Convertir la liste plate en arborescence
  const documents = data as Document[]
  const tree: Document[] = []
  const map = new Map<string, Document>()

  // Créer un map de tous les documents
  documents.forEach(doc => {
    map.set(doc.id, { ...doc, children: [] })
  })

  // Construire l'arborescence
  documents.forEach(doc => {
    const document = map.get(doc.id)!
    if (doc.parent_id) {
      const parent = map.get(doc.parent_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(document)
      }
    } else {
      tree.push(document)
    }
  })

  return tree
}

export async function createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'path'>) {
  // Construire le path ltree
  let path = document.name.toLowerCase().replace(/\s+/g, '_')
  if (document.parent_id) {
    const { data: parent } = await supabase
      .from('documents')
      .select('path')
      .eq('id', document.parent_id)
      .single()
    
    if (parent) {
      path = `${parent.path}.${path}`
    }
  }

  const { data, error } = await supabase
    .from('documents')
    .insert([{ ...document, path }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDocument(id: string, document: Partial<Document>) {
  const { data, error } = await supabase
    .from('documents')
    .update(document)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) throw error
} 