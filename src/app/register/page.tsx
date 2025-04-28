import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";

export default function Register() {
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
            Créer un compte
          </h1>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
} 