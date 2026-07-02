import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">SmartLab</h1>
        <p className="text-sm text-zinc-600">Rastreabilidade Industrial de SPDA</p>
      </div>
      <LoginForm />
    </div>
  );
}
