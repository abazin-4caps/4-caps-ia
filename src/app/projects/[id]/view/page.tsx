"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { DocumentsPanel } from "@/components/project/documents-panel"
import { DocumentViewer } from "@/components/viewers/DocumentViewer"
import { Document } from "@/types/document"
import { Project } from "@/types"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function ProjectViewPage({ params }: { params: { id: string } }) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProject() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setProject(data)
      } catch (error) {
        console.error('Error loading project:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [params.id])

  if (loading) {
    return (
      <DashboardShell className="p-0">
        <div className="p-4">Chargement...</div>
      </DashboardShell>
    )
  }

  if (!project) {
    return (
      <DashboardShell className="p-0">
        <div className="p-4">Projet non trouvé</div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell className="p-0">
      <div className="p-4 border-b">
        <DashboardHeader
          heading={project.title}
          text={project.address}
        />
      </div>
      
      <ResizablePanelGroup 
        direction="horizontal" 
        className="h-[calc(100vh-8rem)]"
      >
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full p-4">
            <DocumentsPanel 
              projectId={params.id}
              onDocumentSelect={setSelectedDocument}
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={75}>
          <div className="h-full p-4">
            <DocumentViewer document={selectedDocument} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </DashboardShell>
  )
} 