"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    console.log("Tentative d'inscription avec:", { email, name })

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      console.log("Réponse inscription Supabase:", { data, error: signUpError })

      if (signUpError) {
        console.error("Erreur détaillée inscription:", signUpError)
        throw signUpError
      }

      if (data?.user) {
        console.log("Inscription réussie, redirection...")
        router.push("/dashboard")
      } else {
        console.log("Inscription en attente de confirmation email")
        setError("Vérifiez votre email pour confirmer votre inscription")
      }
    } catch (error) {
      console.error("Erreur complète inscription:", error)
      if (error instanceof Error) {
        setError(`Erreur: ${error.message}`)
      } else {
        setError("Une erreur est survenue lors de l'inscription")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h2 className="text-2xl font-bold text-center mb-6">Inscription</h2>
      <form onSubmit={handleEmailRegister} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nom complet
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          {loading ? "Inscription..." : "S'inscrire"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <p>
          Déjà un compte ?{" "}
          <Link href="/" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
} 