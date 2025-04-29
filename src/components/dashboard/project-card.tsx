"use client"

import { Project } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'actif':
        return 'bg-green-100 text-green-800'
      case 'en cours':
        return 'bg-green-100 text-green-800'
      case 'en pause':
        return 'bg-yellow-100 text-yellow-800'
      case 'terminé':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card 
      className="p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-white"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>

        <div className="flex items-center text-sm text-gray-500 gap-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{project.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}
      </div>
    </Card>
  )
} 