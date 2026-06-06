import { LoginForm } from "@/components/auth/Loginform";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#075087] ">
      <div className="absolute" />

      <div className="relative z-10 w-full px-6">
        <LoginForm />
      </div>
    </main>
  );
}
