"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function DashboardShell({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userInitials, setUserInitials] = useState("")

  useEffect(() => {
    async function getUserInitials() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        const names = user.user_metadata.full_name.split(' ')
        const initials = names.map((name: string) => name[0]).join('')
        setUserInitials(initials)
      }
    }
    getUserInitials()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#d6dbdc' }}>
      {/* Header */}
      <header className="bg-white border-b shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/LOGO 4 CAPS IA.png"
                alt="4 CAPS IA logo"
                width={80}
                height={17}
                priority
                className="object-contain"
              />
            </div>
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 hover:bg-slate-100"
                  >
                    <span className="font-semibold">{userInitials}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white">
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    Mes projets
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    Mon compte
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 