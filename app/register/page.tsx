import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | Verified Hairs",
  description:
    "Join Verified Hairs — the trusted marketplace for premium hair products. Register as a buyer or vendor.",
};

export default function RegisterPage() {
  return (
    <main
      className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-jet via-chestnut to-honey-dark p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(250,247,242,0.10) 1px, transparent 1px), linear-gradient(to bottom right, var(--color-jet), var(--color-chestnut), var(--color-honey-dark))",
        backgroundSize: "24px 24px, 100% 100%",
      }}
    >
      <RegisterForm />
    </main>
  );
}
