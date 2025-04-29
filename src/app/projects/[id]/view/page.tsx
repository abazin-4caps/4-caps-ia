"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { useEffect, useState } from "react"
import { Project } from "@/types"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    <DashboardShell>
      <div className="flex items-center justify-between mb-8">
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

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="ia">Intelligence Artificielle</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{project.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Informations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <Badge className="mt-1">{project.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de création</p>
                    <p className="mt-1">{new Date(project.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">La gestion des documents sera bientôt disponible.</p>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="ia">
          <Card className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Les fonctionnalités d'IA seront bientôt disponibles.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
} 