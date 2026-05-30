import { LoginForm } from "@/components/auth/Loginform";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050B14]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0d3b66_0%,transparent_60%)]" />

      <div className="bg-grid absolute inset-0 opacity-30" />

      <div className="relative z-10 w-full px-6">
        <LoginForm />
      </div>
    </main>
  );
}
