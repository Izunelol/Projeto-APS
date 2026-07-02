import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-bg px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-fg">
          Smart<span className="text-accent">Lab</span>
        </h1>
        <p className="text-sm text-fg-muted">Rastreabilidade Industrial de SPDA</p>
      </div>
      <LoginForm />
    </div>
  );
}
