"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"

interface UserProfile {
  email: string
  full_name: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      setProfile({
        email: user.email || '',
        full_name: user.user_metadata.full_name || ''
      })
    }

    loadProfile()
  }, [router])

  if (!profile) {
    return (
      <DashboardShell>
        <div>Chargement...</div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Mon compte</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles.
        </p>
      </div>

      <Card className="p-6 bg-white">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nom complet</h3>
            <p className="mt-1">{profile.full_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1">{profile.email}</p>
          </div>
        </div>
      </Card>
    </DashboardShell>
  )
} 