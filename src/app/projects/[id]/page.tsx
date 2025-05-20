"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { useEffect, useState, useRef } from "react"
import { Project } from "@/types"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Pencil, X, Check, FolderOpen } from "lucide-react"
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
import { DocumentViewer } from "@/components/viewers/DocumentViewer"
import { DocumentsPanel } from "@/components/project/documents-panel"
import { Document } from "@/types/document"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<Partial<Project> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const visionneuse = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!selectedDocument || !visionneuse.current) {
      return;
    }

    if (!selectedDocument.url) {
      visionneuse.current.innerHTML = `
        <div class="text-gray-500">
          Ce document n'a pas de fichier associé
        </div>
      `;
      return;
    }

    const fileExtension = selectedDocument.name.split('.').pop()?.toLowerCase()

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
      visionneuse.current.innerHTML = `
        <div class="w-full h-full flex items-center justify-center">
          <img 
            src="${selectedDocument.url}" 
            alt="${selectedDocument.name}"
            class="max-w-full max-h-full object-contain"
          />
        </div>
      `
      return
    }

    if (fileExtension === 'pdf') {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(selectedDocument.url)}&embedded=true`
      visionneuse.current.innerHTML = `
        <iframe
          src="${viewerUrl}"
          class="w-full h-full border-0"
          title="${selectedDocument.name}"
        ></iframe>
      `
      return
    }

    visionneuse.current.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full">
        <p class="text-gray-500">Ce type de fichier ne peut pas être visualisé directement</p>
        <a 
          href="${selectedDocument.url}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-blue-500 hover:underline mt-2"
        >
          Télécharger le fichier
        </a>
      </div>
    `
  }, [selectedDocument])

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
        <div className="p-4">Chargement...</div>
      </DashboardShell>
    )
  }

  if (!project || !editedProject) {
    return (
      <DashboardShell>
        <div className="p-4">Projet non trouvé</div>
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
                onClick={() => router.push(`/projects/${params.id}/view`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Ouvrir
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

      <Card className="p-6 bg-white mb-8">
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

      <div className="flex gap-4">
        {/* Zone Documents */}
        <div className="w-1/3">
          <DocumentsPanel 
            projectId={params.id} 
            onDocumentSelect={setSelectedDocument}
          />
        </div>
        <div ref={visionneuse} className="min-h-[400px] border rounded-lg p-4">
          {!selectedDocument && (
            <div className="text-gray-500">
              Sélectionnez un document pour le visualiser
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
} 