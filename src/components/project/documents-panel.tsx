"use client"

import { useEffect, useState } from "react"
import { FolderTree, File, FolderOpen, FolderClosed, Plus, Upload, Pencil, Trash2 } from "lucide-react"
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
import { DocumentTree } from "@/components/documents/document-tree"

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

  useEffect(() => {
    loadDocuments()
  }, [projectId])

  const loadDocuments = async () => {
    try {
      const docs = await getProjectDocuments(projectId)
      setDocuments(docs)
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
      await loadDocuments()
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
      await loadDocuments()
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
      await loadDocuments()
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
        await loadDocuments()
        
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

  const renderDocuments = (docs: Document[], depth: number = 0) => {
    return docs.map((doc) => (
      <div key={doc.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className="flex items-center gap-2 py-1 px-2 hover:bg-slate-100 rounded-md cursor-pointer"
              style={{ paddingLeft: `${(depth + 1) * 12}px` }}
              onClick={() => {
                if (doc.type === 'folder') {
                  toggleFolder(doc)
                } else if (doc.file_url) {
                  window.open(doc.file_url, '_blank')
                }
              }}
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
                  <Upload className="h-4 w-4 mr-2" />
                  Importer des fichiers
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

    if (!selectedDocument.file_url) {
      return (
        <div className="text-gray-500">
          Ce document n'a pas de fichier associé
        </div>
      )
    }

    // Utiliser Google Docs Viewer pour afficher le document
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(selectedDocument.file_url)}&embedded=true`
    
    return (
      <iframe
        src={viewerUrl}
        className="w-full h-full border-0"
        title={selectedDocument.name}
      />
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-gray-500">Chargement des documents...</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCreateFolder()}
            disabled={loading || uploading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Dossier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleImport()}
            disabled={loading || uploading}
          >
            <Upload className="h-4 w-4 mr-1" />
            Importer
          </Button>
        </div>
      </div>

      <DocumentTree
        documents={documents}
        selectedDocument={selectedDocument}
        onSelectDocument={(doc) => {
          setSelectedDocument(doc)
          onDocumentSelect?.(doc)
        }}
      />

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
    </div>
  )
} 