import { supabase } from "@/lib/supabase"
import { Project } from "@/types"

export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data as Project[]
}

export async function getProjectStats(userId: string) {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('status')
    .eq('user_id', userId)

  if (error) throw error

  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'terminé').length,
    inProgress: projects.filter(p => p.status === 'en_cours').length
  }

  return stats
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProject(id: number, project: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(id: number) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
} 