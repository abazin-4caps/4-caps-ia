import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function LoginForm() {
  return (
    <div className="auth-card">
      <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="exemple@4caps.fr"
            required
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
          />
        </div>
        <Button className="w-full">
          Se connecter
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