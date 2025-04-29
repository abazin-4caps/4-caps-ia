"use client"

import { useEffect, useState } from "react"
import { FolderTree, File, FolderOpen, FolderClosed, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Document } from "@/types/document"
import { getProjectDocuments, createDocument, uploadFile } from "@/lib/documents"
import { useToast } from "@/components/ui/use-toast"

interface DocumentsPanelProps {
  projectId: string
}

export function DocumentsPanel({ projectId }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>()
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

  const handleImport = async (parentId?: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files || files.length === 0) return

      setUploading(true)
      try {
        for (const file of Array.from(files)) {
          await uploadFile(file, projectId, parentId)
          toast({
            title: "Succès",
            description: `${file.name} a été importé avec succès`
          })
        }
        await loadDocuments()
      } catch (error) {
        console.error('Error importing files:', error)
        toast({
          title: "Erreur",
          description: "Impossible d'importer certains fichiers",
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
                  Nouveau dossier
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleImport(doc.id)}>
                  Importer des fichiers
                </ContextMenuItem>
              </>
            )}
            <ContextMenuItem className="text-red-600">
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-gray-500">Chargement des documents...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          <h2 className="font-semibold">Documents</h2>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            title="Nouveau dossier"
            onClick={() => handleCreateFolder()}
            disabled={uploading}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="Importer"
            onClick={() => handleImport()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {uploading ? (
          <div className="text-sm text-gray-500 text-center mt-4">
            Import des fichiers en cours...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-sm text-gray-500 text-center mt-4">
            Aucun document
          </div>
        ) : (
          renderDocuments(documents)
        )}
      </div>

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
    </div>
  )
} 