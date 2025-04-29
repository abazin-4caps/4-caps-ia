"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { useEffect, useState } from "react"
import { Project } from "@/types"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquareText } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { DocumentsPanel } from "@/components/project/documents-panel"

export default function ProjectViewPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadProject() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/')
          return
        }

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setProject(data)
      } catch (error) {
        console.error('Error loading project:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [params.id, router])

  if (loading) {
    return (
      <DashboardShell>
        <div>Chargement...</div>
      </DashboardShell>
    )
  }

  if (!project) {
    return (
      <DashboardShell>
        <div>Projet non trouvé</div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell className="p-0">
      <div className="flex items-center justify-between p-4 border-b">
        <DashboardHeader
          heading={project.title}
          text={project.address}
        />
        <Button 
          variant="outline"
          onClick={() => router.push(`/projects/${params.id}`)}
        >
          Retour au projet
        </Button>
      </div>

      <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-8rem)]">
        {/* Panneau Documents */}
        <ResizablePanel defaultSize={20}>
          <DocumentsPanel projectId={params.id} />
        </ResizablePanel>
        
        <ResizableHandle />

        {/* Panneau Visionneuse */}
        <ResizablePanel defaultSize={50}>
          <div className="h-full border-r p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <h2 className="font-semibold">Visionneuse</h2>
            </div>
            <div className="text-sm text-gray-500">
              La visionneuse de documents sera bientôt disponible.
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Panneau IA */}
        <ResizablePanel defaultSize={30}>
          <div className="h-full p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquareText className="h-5 w-5" />
              <h2 className="font-semibold">Intelligence Artificielle</h2>
            </div>
            <div className="text-sm text-gray-500">
              Le chat avec l'IA sera bientôt disponible.
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </DashboardShell>
  )
} 