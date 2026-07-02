import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Criar conta</h1>
        <p className="text-sm text-zinc-600">Acesso ao SmartLab de Rastreabilidade</p>
      </div>
      <RegisterForm />
    </div>
  );
}
