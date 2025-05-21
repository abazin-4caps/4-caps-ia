import { supabase } from "@/lib/supabase"
import { Document } from "@/types/document"

// Fonction utilitaire pour sanitizer les chemins ltree
function sanitizeLtreePath(path: string): string {
  return path
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .replace(/^[0-9]/, 'n$&')
}

export async function getProjectDocuments(projectId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return data || []
}

export async function createDocument(document: Partial<Document>): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert(document)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function uploadFile(file: File, projectId: string, parentId?: string) {
  try {
    // Vérifier si un fichier avec le même nom existe déjà
    const { data: existingFiles, error: existingError } = await supabase
      .from('documents')
      .select('name')
      .eq('project_id', projectId)
      .eq('parent_id', parentId || null)
      .eq('type', 'file')

    if (existingError) throw existingError

    // Générer un nom unique si nécessaire
    let uniqueName = file.name
    if (existingFiles?.some(f => f.name === file.name)) {
      const ext = file.name.lastIndexOf('.')
      const baseName = ext !== -1 ? file.name.slice(0, ext) : file.name
      const extension = ext !== -1 ? file.name.slice(ext) : ''
      let counter = 1
      
      while (existingFiles.some(f => f.name === uniqueName)) {
        uniqueName = `${baseName} (${counter})${extension}`
        counter++
      }
    }

    // 1. Créer l'entrée dans la table documents
    const document = await createDocument({
      name: uniqueName,
      type: 'file',
      project_id: projectId,
      parent_id: parentId
    })

    // 2. Upload le fichier dans le bucket
    const filePath = `${projectId}/${document.id}/${uniqueName}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      // Si l'upload échoue, supprimer l'entrée dans la table
      await deleteDocument(document.id)
      throw new Error(`Erreur lors de l'upload du fichier: ${uploadError.message}`)
    }

    // 3. Vérifier que le fichier est accessible
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Vérifier l'accès au fichier
    const response = await fetch(publicUrl, { method: 'HEAD' })
    if (!response.ok) {
      await deleteDocument(document.id)
      throw new Error('Le fichier a été uploadé mais n\'est pas accessible')
    }

    // 4. Mettre à jour le document avec l'URL du fichier
    const updatedDoc = await updateDocument(document.id, {
      file_url: publicUrl
    })

    return updatedDoc
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export async function checkAndFixDocuments(projectId: string) {
  try {
    // 1. Récupérer tous les documents du projet
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('type', 'file')

    if (fetchError) throw fetchError

    // 2. Vérifier chaque document
    for (const doc of documents) {
      if (!doc.file_url) continue

      try {
        // Vérifier l'accès au fichier
        const response = await fetch(doc.file_url, { method: 'HEAD' })
        if (!response.ok) {
          // Si le fichier n'est pas accessible, supprimer le document
          await deleteDocument(doc.id)
          console.warn(`Document supprimé car inaccessible: ${doc.name}`)
        }
      } catch (error) {
        // En cas d'erreur, supprimer le document
        await deleteDocument(doc.id)
        console.warn(`Document supprimé suite à une erreur: ${doc.name}`)
      }
    }

    return true
  } catch (error) {
    console.error('Error checking documents:', error)
    throw error
  }
} 