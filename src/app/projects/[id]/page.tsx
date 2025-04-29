"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { useEffect, useState } from "react"
import { Project } from "@/types"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Pencil, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateProject, deleteProject } from "@/lib/projects"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<Partial<Project> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
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
        setEditedProject(data)
      } catch (error) {
        console.error('Error loading project:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [params.id, router])

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

  const handleSave = async () => {
    if (!project || !editedProject) return
    setSaving(true)
    try {
      const updatedProject = await updateProject(project.id, editedProject)
      setProject(updatedProject)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProject(project)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return
    }
    setDeleting(true)
    try {
      await deleteProject(Number(params.id))
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div>Chargement...</div>
      </DashboardShell>
    )
  }

  if (!project || !editedProject) {
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
          text="Détails du projet"
        />
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Retour aux projets
              </Button>
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Modifier
              </Button>
              <Button 
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="p-6 bg-white">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1 mr-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">
                      Titre
                    </label>
                    <Input
                      value={editedProject.title}
                      onChange={(e) => setEditedProject({
                        ...editedProject,
                        title: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">
                      Adresse
                    </label>
                    <Input
                      value={editedProject.address}
                      onChange={(e) => setEditedProject({
                        ...editedProject,
                        address: e.target.value
                      })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
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
                </>
              )}
            </div>
            {isEditing ? (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Statut
                </label>
                <Select
                  value={editedProject.status}
                  onValueChange={(value: string) => setEditedProject({
                    ...editedProject,
                    status: value as Project['status']
                  })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="en cours">En cours</SelectItem>
                    <SelectItem value="terminé">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">
              Description
            </label>
            {isEditing ? (
              <Textarea
                value={editedProject.description}
                onChange={(e) => setEditedProject({
                  ...editedProject,
                  description: e.target.value
                })}
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-gray-700">{project.description}</p>
            )}
          </div>
        </div>
      </Card>
    </DashboardShell>
  )
} 