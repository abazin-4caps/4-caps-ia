import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";

export default function Register() {
  return (
    <div className="auth-container">
      <div className="text-center">
        <Image
          src="/LOGO 4 CAPS IA.png"
          alt="4 CAPS IA logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-2xl font-bold mt-4">
          Créer un compte
        </h1>
      </div>
      <RegisterForm />
    </div>
  );
} 