"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserNav } from "./user-nav"

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({
  children,
  className
}: DashboardShellProps) {
  const router = useRouter()

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
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
        {children}
      </main>
    </div>
  )
} 