export type Project = {
  id: number
  title: string
  description: string
  address: string
  status: 'actif' | 'en cours' | 'terminé'
  created_at: string
  updated_at: string
  user_id: string
} 