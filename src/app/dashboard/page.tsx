"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building, CheckCircle, FileText, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { ProjectCard } from "@/components/dashboard/project-card"
import { useEffect, useState } from "react"
import { Project } from "@/types"
import { getProjects, getProjectStats } from "@/lib/projects"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProjectStats {
  total: number
  completed: number
  inProgress: number
}

type SortOption = "date" | "title" | "status"
type FilterOption = "all" | "en_cours" | "terminé"

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats>({ total: 0, completed: 0, inProgress: 0 })
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [filterStatus, setFilterStatus] = useState<FilterOption>("all")
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

  const sortProjects = (projects: Project[]) => {
    return [...projects].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })
  }

  const filterProjects = (projects: Project[]) => {
    if (filterStatus === "all") return projects
    return projects.filter(project => project.status === filterStatus)
  }

  const displayedProjects = sortProjects(filterProjects(projects))

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
        <Card 
          className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white cursor-pointer"
          onClick={() => setFilterStatus("all")}
        >
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
        <Card 
          className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white cursor-pointer"
          onClick={() => setFilterStatus("terminé")}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Projets terminés</div>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </div>
          </div>
        </Card>
        <Card 
          className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white cursor-pointer"
          onClick={() => setFilterStatus("en_cours")}
        >
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

      <div className="flex gap-4 mb-6">
        <Select value={filterStatus} onValueChange={(value: FilterOption) => setFilterStatus(value)}>
          <SelectTrigger className="w-[140px] bg-white hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtres</span>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem 
              value="all" 
              className="hover:bg-slate-100 transition-colors cursor-pointer focus:bg-slate-100"
            >
              Tous les projets
            </SelectItem>
            <SelectItem 
              value="en_cours"
              className="hover:bg-slate-100 transition-colors cursor-pointer focus:bg-slate-100"
            >
              En cours
            </SelectItem>
            <SelectItem 
              value="terminé"
              className="hover:bg-slate-100 transition-colors cursor-pointer focus:bg-slate-100"
            >
              Terminés
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-[140px] bg-white hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span>Trier par</span>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem 
              value="date"
              className="hover:bg-slate-100 transition-colors cursor-pointer focus:bg-slate-100"
            >
              Date
            </SelectItem>
            <SelectItem 
              value="title"
              className="hover:bg-slate-100 transition-colors cursor-pointer focus:bg-slate-100"
            >
              Titre
            </SelectItem>
            <SelectItem 
              value="status"
              className="hover:bg-slate-100 transition-colors cursor-pointer focus:bg-slate-100"
            >
              Statut
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {displayedProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {displayedProjects.length === 0 && (
          <Card className="md:col-span-3 p-8 text-center text-gray-500 shadow-lg bg-white">
            <p className="text-lg">Aucun projet ne correspond aux critères.</p>
            <p className="mt-2">Modifiez vos filtres ou créez un nouveau projet.</p>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
} 