"use client"

import { useEffect, useState } from "react"
import { FolderTree, File, FolderOpen, FolderClosed, Plus, DownloadIcon, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Document } from "@/types/document"
import { getProjectDocuments, createDocument, uploadFile, updateDocument, deleteDocument } from "@/lib/documents"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { DocumentTree } from "@/components/documents/document-tree"
import { Folder, Upload, X } from "lucide-react"

interface DocumentsPanelProps {
  projectId: string
  onDocumentSelect?: (document: Document | null) => void
}

export function DocumentsPanel({ projectId, onDocumentSelect }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>()
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const { toast } = useToast()
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: number }>({})

  const sortDocuments = (docs: Document[]): Document[] => {
    return [...docs].sort((a, b) => {
      // Si les deux sont des dossiers ou les deux sont des fichiers, trier par nom
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      // Les dossiers viennent en premier
      return a.type === 'folder' ? -1 : 1
    }).map(doc => {
      if (doc.type === 'folder' && doc.children) {
        return {
          ...doc,
          children: sortDocuments(doc.children)
        }
      }
      return doc
    })
  }

  const refreshDocuments = async () => {
    try {
      const docs = await getProjectDocuments(projectId)
      setDocuments(sortDocuments(docs))
    } catch (error) {
      console.error('Error loading documents:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshDocuments()
  }, [projectId])

  const handleCreateFolder = async (parentId?: string) => {
    setSelectedParentId(parentId)
    setNewFolderName("")
    setIsCreateFolderOpen(true)
  }

  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du dossier ne peut pas être vide",
        variant: "destructive"
      })
      return
    }

    try {
      await createDocument({
        name: newFolderName.trim(),
        type: "folder",
        project_id: projectId,
        parent_id: selectedParentId
      })
      await refreshDocuments()
      setIsCreateFolderOpen(false)
      toast({
        title: "Succès",
        description: "Dossier créé avec succès"
      })
    } catch (error) {
      console.error('Error creating folder:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le dossier",
        variant: "destructive"
      })
    }
  }

  const handleRename = (doc: Document) => {
    setSelectedDocument(doc)
    setNewFolderName(doc.name)
    setIsRenameOpen(true)
  }

  const handleRenameSubmit = async () => {
    if (!selectedDocument || !newFolderName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom ne peut pas être vide",
        variant: "destructive"
      })
      return
    }

    try {
      await updateDocument(selectedDocument.id, {
        name: newFolderName.trim()
      })
      await refreshDocuments()
      setIsRenameOpen(false)
      toast({
        title: "Succès",
        description: "Document renommé avec succès"
      })
    } catch (error) {
      console.error('Error renaming document:', error)
      toast({
        title: "Erreur",
        description: "Impossible de renommer le document",
        variant: "destructive"
      })
    }
  }

  const handleDelete = (doc: Document) => {
    setSelectedDocument(doc)
    setIsDeleteOpen(true)
  }

  const handleDeleteSubmit = async () => {
    if (!selectedDocument) return

    try {
      await deleteDocument(selectedDocument.id)
      await refreshDocuments()
      setIsDeleteOpen(false)
      toast({
        title: "Succès",
        description: selectedDocument.type === 'folder' 
          ? "Dossier supprimé avec succès"
          : "Fichier supprimé avec succès"
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive"
      })
    }
  }

  const handleImport = async (parentId?: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files || files.length === 0) return

      setUploading(true)
      let hasErrors = false
      
      try {
        for (const file of Array.from(files)) {
          try {
            const doc = await uploadFile(file, projectId, parentId)
            if (doc) {
              // Mettre à jour l'état local immédiatement
              setDocuments(prevDocs => {
                const newDocs = [...prevDocs]
                if (parentId) {
                  // Ajouter à un dossier parent
                  const updateChildren = (docs: Document[]) => {
                    for (const d of docs) {
                      if (d.id === parentId) {
                        d.children = [...(d.children || []), doc]
                        return true
                      }
                      if (d.children && updateChildren(d.children)) {
                        return true
                      }
                    }
                    return false
                  }
                  updateChildren(newDocs)
                } else {
                  // Ajouter à la racine
                  newDocs.push(doc)
                }
                return newDocs
              })
              
              toast({
                title: "Succès",
                description: `${file.name} a été importé avec succès`
              })
            }
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error)
            hasErrors = true
          }
        }
        
        // Recharger la liste complète après tous les uploads
        await refreshDocuments()
        
        if (hasErrors) {
          toast({
            title: "Attention",
            description: "Certains fichiers n'ont pas pu être importés",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error in import process:', error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue pendant l'import",
          variant: "destructive"
        })
      } finally {
        setUploading(false)
      }
    }

    input.click()
  }

  const toggleFolder = (doc: Document) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(doc.id)) {
      newExpanded.delete(doc.id)
    } else {
      newExpanded.add(doc.id)
    }
    setExpandedFolders(newExpanded)
  }

  const handleDocumentClick = (doc: Document) => {
    console.log('Document clicked:', doc)
    if (doc.type === 'folder') {
      toggleFolder(doc)
    } else {
      setSelectedDocument(doc)
      onDocumentSelect?.(doc)
    }
  }

  const renderDocuments = (docs: Document[], depth: number = 0) => {
    return docs.map((doc) => (
      <div key={doc.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className="flex items-center gap-2 py-1 px-2 hover:bg-slate-100 rounded-md cursor-pointer"
              style={{ paddingLeft: `${(depth + 1) * 12}px` }}
              onClick={() => handleDocumentClick(doc)}
            >
              {doc.type === 'folder' ? (
                expandedFolders.has(doc.id) ? (
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                ) : (
                  <FolderClosed className="h-4 w-4 text-blue-600" />
                )
              ) : (
                <File className="h-4 w-4 text-gray-600" />
              )}
              <span className="text-sm">{doc.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {doc.type === 'folder' && (
              <>
                <ContextMenuItem onClick={() => handleCreateFolder(doc.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau dossier
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleImport(doc.id)}>
                  <svg 
                    className="h-4 w-4 mr-1" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <path d="M12 8v8"/>
                    <path d="M8 12h8"/>
                  </svg>
                  Importer
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}
            <ContextMenuItem onClick={() => handleRename(doc)}>
              <Pencil className="h-4 w-4 mr-2" />
              Renommer
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleDelete(doc)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {doc.type === 'folder' &&
          expandedFolders.has(doc.id) &&
          doc.children &&
          renderDocuments(doc.children, depth + 1)}
      </div>
    ))
  }

  const renderViewer = () => {
    if (!selectedDocument || selectedDocument.type === 'folder') {
      return (
        <div className="text-gray-500">
          Sélectionnez un document pour le visualiser
        </div>
      )
    }

    if (!selectedDocument.url) {
      return (
        <div className="text-gray-500">
          Ce document n'a pas de fichier associé
        </div>
      )
    }

    // Utiliser Google Docs Viewer pour afficher le document
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(selectedDocument.url)}&embedded=true`
    
    return (
      <iframe
        src={viewerUrl}
        className="w-full h-full border-0"
        title={selectedDocument.name}
      />
    )
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadFile = async (file: File) => {
      try {
        // Créer l'enregistrement dans la base de données
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            name: file.name,
            type: 'file',
            project_id: projectId,
            parent_id: null,
          })
          .select()
          .single();

        if (docError) throw docError;

        // Upload le fichier
        const filePath = `${projectId}/${docData.id}/${file.name}`;
        const { error: uploadError, data } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Mettre à jour la progression à 100% une fois l'upload terminé
        setUploadingFiles(prev => ({
          ...prev,
          [file.name]: 100
        }));

        // Mettre à jour le document avec le chemin du fichier
        const { error: updateError } = await supabase
          .from('documents')
          .update({ path: filePath })
          .eq('id', docData.id);

        if (updateError) throw updateError;

        // Obtenir l'URL publique
        const { data: { publicUrl } } = await supabase
          .storage
          .from('documents')
          .getPublicUrl(filePath);

        // Mettre à jour le document avec l'URL
        const { error: finalUpdateError } = await supabase
          .from('documents')
          .update({ url: publicUrl })
          .eq('id', docData.id);

        if (finalUpdateError) throw finalUpdateError;

        // Recharger les documents
        refreshDocuments();

        toast({
          title: "Succès",
          description: `${file.name} a été uploadé avec succès`,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Erreur",
          description: `Erreur lors de l'upload de ${file.name}`,
          variant: "destructive",
        });
      } finally {
        setUploadingFiles(prev => {
          const newState = { ...prev };
          delete newState[file.name];
          return newState;
        });
      }
    };

    // Upload chaque fichier
    Array.from(files).forEach(uploadFile);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-gray-500">Chargement des documents...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#E5E7EB]">
      <div className="p-4 border-b bg-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Documents</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateFolder()}
              disabled={loading || uploading}
              className="bg-[#E5E7EB]"
            >
              <Folder className="h-4 w-4 mr-1" />
              Dossier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={loading || uploading}
              className="bg-[#E5E7EB]"
            >
              <Upload className="h-4 w-4 mr-1" />
              Importer
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-[#E5E7EB]">
        {renderDocuments(documents)}
      </div>

      {/* Dialogs */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nom du dossier"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolderSubmit()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateFolderSubmit}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nouveau nom"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameSubmit()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRenameSubmit}>
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              {selectedDocument?.type === 'folder' 
                ? "Êtes-vous sûr de vouloir supprimer ce dossier et tout son contenu ?"
                : "Êtes-vous sûr de vouloir supprimer ce fichier ?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSubmit}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Object.entries(uploadingFiles).map(([fileName, progress]) => (
        <div key={fileName} className="text-sm text-gray-500">
          Uploading {fileName}: {progress}%
        </div>
      ))}

      {selectedDocument && !selectedDocument.url && (
        <div className="text-gray-500">
          Ce document n'a pas de fichier associé
        </div>
      )}
    </div>
  )
} 