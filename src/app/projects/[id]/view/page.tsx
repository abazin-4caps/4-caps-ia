"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { DocumentsPanel } from "@/components/project/documents-panel"
import { DocumentViewer } from "@/components/viewers/DocumentViewer"
import { Document } from "@/types/document"
import { useState } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function ProjectViewPage({ params }: { params: { id: string } }) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Visualisation du projet"
        text="Consultez et gérez les documents du projet"
      />
      
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
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