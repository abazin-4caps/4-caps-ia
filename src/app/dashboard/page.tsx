"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building, CheckCircle, FileText } from "lucide-react"
import { ProjectCard } from "@/components/dashboard/project-card"
import { useEffect, useState } from "react"
import { Project } from "@/types"
import { getProjects, getProjectStats } from "@/lib/projects"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface ProjectStats {
  total: number
  active: number
  inProgress: number
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats>({ total: 0, active: 0, inProgress: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/')
          return
        }

        const [projectsData, projectStats] = await Promise.all([
          getProjects(user.id),
          getProjectStats(user.id)
        ])

        setProjects(projectsData)
        setStats(projectStats)
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <DashboardShell>
        <div>Chargement...</div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="Projets immobiliers"
          text="Gérez vos projets immobiliers."
        />
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => router.push('/projects/new')}
        >
          Nouveau projet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-500" />
            <div className="text-sm text-gray-500">Total des projets</div>
          </div>
          <div className="mt-3 text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="text-sm text-gray-500">Projets actifs</div>
          </div>
          <div className="mt-3 text-2xl font-bold">{stats.active}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <div className="text-sm text-gray-500">Projets en cours</div>
          </div>
          <div className="mt-3 text-2xl font-bold">{stats.inProgress}</div>
        </Card>
      </div>

      <div className="mt-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {projects.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            Aucun projet pour le moment. Créez votre premier projet !
          </Card>
        )}
      </div>
    </DashboardShell>
  )
} 