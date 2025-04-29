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
  // Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

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
    .insert([{ ...document, path, created_by: user.id }])
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

export async function uploadFile(file: File, projectId: string, parentId?: string) {
  try {
    // 1. Créer l'entrée dans la table documents
    const document = await createDocument({
      name: file.name,
      type: 'file',
      project_id: projectId,
      parent_id: parentId
    })

    // 2. Upload le fichier dans le bucket
    const filePath = `${projectId}/${document.id}/${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      // Si l'upload échoue, supprimer l'entrée dans la table
      await deleteDocument(document.id)
      throw uploadError
    }

    // 3. Mettre à jour le document avec l'URL du fichier
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    await updateDocument(document.id, {
      file_url: publicUrl
    })

    return document
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
} 