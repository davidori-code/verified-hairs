import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main
      className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-jet via-chestnut to-honey-dark p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(250,247,242,0.10) 1px, transparent 1px), linear-gradient(to bottom right, var(--color-jet), var(--color-chestnut), var(--color-honey-dark))",
        backgroundSize: "24px 24px, 100% 100%",
      }}
    >
      <LoginForm />
    </main>
  );
}
