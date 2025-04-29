"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    console.log("Tentative de connexion avec:", email)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Réponse Supabase:", { data, error })

      if (error) {
        console.error("Erreur détaillée:", error)
        throw error
      }

      if (data?.user) {
        console.log("Connexion réussie, redirection...")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Erreur complète:", error)
      if (error instanceof Error) {
        setError(`Erreur: ${error.message}`)
      } else {
        setError("Une erreur est survenue lors de la connexion")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
      <form onSubmit={handleEmailLogin} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="exemple@4caps.fr"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <div className="mb-2">
          <Link href="#" className="text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <div>
          <p>
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-primary hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 