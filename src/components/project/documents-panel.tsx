"use client"

import { useState } from "react"
import { FolderTree, File, FolderOpen, FolderClosed, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
}

interface DocumentsPanelProps {
  projectId: string
}

export function DocumentsPanel({ projectId }: DocumentsPanelProps) {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      children: [
        {
          id: '2',
          name: 'Plans',
          type: 'folder',
          children: []
        },
        {
          id: '3',
          name: 'Devis',
          type: 'folder',
          children: []
        }
      ]
    }
  ])

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']))

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.id} style={{ marginLeft: `${level * 16}px` }}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className="flex items-center gap-2 py-1 px-2 hover:bg-slate-100 rounded-md cursor-pointer"
              onClick={() => node.type === 'folder' && toggleFolder(node.id)}
            >
              {node.type === 'folder' ? (
                expandedFolders.has(node.id) ? (
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                ) : (
                  <FolderClosed className="h-4 w-4 text-blue-600" />
                )
              ) : (
                <File className="h-4 w-4 text-gray-600" />
              )}
              <span className="text-sm">{node.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {node.type === 'folder' && (
              <>
                <ContextMenuItem>
                  Nouveau dossier
                </ContextMenuItem>
                <ContextMenuItem>
                  Nouveau fichier
                </ContextMenuItem>
              </>
            )}
            <ContextMenuItem className="text-red-600">
              Supprimer
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {node.type === 'folder' && expandedFolders.has(node.id) && node.children && (
          <div className="mt-1">
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          <h2 className="font-semibold">Documents</h2>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" title="Nouveau dossier">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Importer">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {renderFileTree(files)}
      </div>
    </div>
  )
} 