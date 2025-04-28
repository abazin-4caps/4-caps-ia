import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function Login() {
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
          Se connecter
        </h1>
      </div>
      <LoginForm />
    </div>
  );
} 