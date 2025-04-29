import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
        <Image
            src="/LOGO 4 CAPS IA.png"
            alt="4 CAPS IA logo"
          width={180}
          height={38}
          priority
            className="mb-8"
          />
          <h1 className="text-2xl font-bold text-center mb-8">
            Bienvenue sur 4 CAPS IA
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
