"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface Project {
  id: number
  title: string
  description: string
  address: string
  status: string
  createdAt: string
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              {project.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          <p className="text-sm text-gray-500 mt-1">{project.address}</p>
          <p className="text-sm text-gray-500 mt-1">Créé le {project.createdAt}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/projects/${project.id}`}>
            Voir les détails
          </Link>
        </Button>
      </div>
    </Card>
  )
} 