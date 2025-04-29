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
      <div className="flex items-center justify-between mb-8">
        <DashboardHeader
          heading="Mes projets"
          text="Gérez vos projets immobiliers."
        />
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => router.push('/projects/new')}
        >
          Nouveau projet
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Building className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Total des projets</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Projets actifs</div>
              <div className="text-2xl font-bold">{stats.active}</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Projets en cours</div>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {projects.length === 0 && (
          <Card className="md:col-span-3 p-8 text-center text-gray-500 shadow-lg">
            <p className="text-lg">Aucun projet pour le moment.</p>
            <p className="mt-2">Créez votre premier projet !</p>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
} 