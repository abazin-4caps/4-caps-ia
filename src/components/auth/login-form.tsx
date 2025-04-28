import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  return (
    <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
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
        <a href="#" className="text-primary hover:underline">
          Mot de passe oublié ?
        </a>
      </div>
    </div>
  )
} 