"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building, CheckCircle, FileText } from "lucide-react"
import { ProjectCard } from "@/components/dashboard/project-card"
import { useState } from "react"

export default function DashboardPage() {
  const [projects] = useState([
    {
      id: 1,
      title: "Mon premier projet en ligne",
      description: "La description de mon premier projet en ligne",
      address: "1 RUE DU VAL - 92190 MEUDON",
      status: "Actif",
      createdAt: "20/04/2025"
    }
  ])

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="Projets immobiliers"
          text="Gérez vos projets immobiliers."
        />
        <Button className="bg-blue-500 hover:bg-blue-600">
          Nouveau projet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-500" />
            <div className="text-sm text-gray-500">Total des projets</div>
          </div>
          <div className="mt-3 text-2xl font-bold">1</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="text-sm text-gray-500">Projets actifs</div>
          </div>
          <div className="mt-3 text-2xl font-bold">1</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <div className="text-sm text-gray-500">Projets en cours</div>
          </div>
          <div className="mt-3 text-2xl font-bold">0</div>
        </Card>
      </div>

      <div className="mt-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </DashboardShell>
  )
} 