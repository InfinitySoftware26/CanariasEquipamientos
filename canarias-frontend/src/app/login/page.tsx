import { LoginForm } from "@/components/auth/Loginform";

export default function LoginPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{
        background: `
      radial-gradient(
        circle at center,
        #053a66 0%,
        #075087 45%,
        #0b6aa8 100%
      )
    `,
      }}
    >
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* glow decorativo corporativo */}
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#ffa408]/20 blur-[140px]" />

      <div className="relative z-10 w-full px-6">
        <LoginForm />
      </div>
    </main>
  );
}
