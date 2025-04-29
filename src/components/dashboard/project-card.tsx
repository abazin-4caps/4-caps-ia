"use client"

import { Project } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            {project.description}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status:</span>
            <span className="text-sm text-muted-foreground capitalize">
              {project.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Created:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 