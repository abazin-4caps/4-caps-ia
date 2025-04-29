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

  // Sanitize le nom pour le path ltree
  let sanitizedName = document.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_') // Remplace tous les caractères non alphanumériques par _
    .replace(/_+/g, '_')        // Remplace les séquences de _ par un seul _
    .replace(/^_|_$/g, '')      // Supprime les _ au début et à la fin
    .replace(/^[0-9]/, 'n$&')   // Ajoute 'n' devant si ça commence par un chiffre

  // Si le nom est vide après sanitization, utiliser un fallback
  if (!sanitizedName) {
    sanitizedName = 'document_' + Date.now()
  }

  // Construire le path ltree
  let path = sanitizedName
  if (document.parent_id) {
    const { data: parent } = await supabase
      .from('documents')
      .select('path')
      .eq('id', document.parent_id)
      .single()
    
    if (parent) {
      path = `${parent.path}.${sanitizedName}`
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
  try {
    // 1. Récupérer le document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (docError) throw docError

    // 2. Si c'est un fichier, supprimer le fichier du storage
    if (doc.type === 'file' && doc.file_url) {
      const filePath = `${doc.project_id}/${doc.id}/${doc.name}`
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath])

      if (storageError) throw storageError
    }

    // 3. Récupérer tous les documents enfants
    const { data: children, error: childrenError } = await supabase
      .from('documents')
      .select('id')
      .eq('project_id', doc.project_id)
      .filter('path', '~', `${doc.path}.*`)

    if (childrenError) throw childrenError

    // 4. Supprimer les enfants s'il y en a
    if (children && children.length > 0) {
      const childrenIds = children.map(child => child.id)
      const { error: deleteChildrenError } = await supabase
        .from('documents')
        .delete()
        .in('id', childrenIds)

      if (deleteChildrenError) throw deleteChildrenError
    }

    // 5. Supprimer le document lui-même
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
  } catch (error) {
    console.error('Error in deleteDocument:', error)
    throw error
  }
}

export async function uploadFile(file: File, projectId: string, parentId?: string) {
  try {
    // Vérifier si un fichier avec le même nom existe déjà
    const { data: existingFiles } = await supabase
      .from('documents')
      .select('name')
      .eq('project_id', projectId)
      .eq('parent_id', parentId || null)
      .eq('type', 'file')

    // Générer un nom unique si nécessaire
    let uniqueName = file.name
    if (existingFiles?.some(f => f.name === file.name)) {
      const ext = file.name.lastIndexOf('.')
      const baseName = ext !== -1 ? file.name.slice(0, ext) : file.name
      const extension = ext !== -1 ? file.name.slice(ext) : ''
      let counter = 1
      
      // Essayer avec des suffixes (1), (2), etc. jusqu'à trouver un nom unique
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