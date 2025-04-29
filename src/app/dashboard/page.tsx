import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Tableau de bord"
        text="Gérez vos projets et vos paramètres."
      />
    </DashboardShell>
  )
} 