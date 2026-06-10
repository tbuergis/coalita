import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { persona?: string };
}) {
  const persona = searchParams.persona;

  // Schritt 1: Persona-Auswahl
  if (!persona) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coalita</h1>
            <p className="mt-2 text-gray-500">Mitgliedschaft beantragen</p>
          </div>

          <div className="flex items-center gap-2 mb-8">
            <div className="flex-1 h-1.5 rounded-full bg-blue-600" />
            <div className="flex-1 h-1.5 rounded-full bg-gray-200" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <p className="text-sm font-medium text-gray-700 mb-4">Ich möchte mich anmelden als…</p>
            <div className="grid grid-cols-1 gap-4">
              <a
                href="/register?persona=member"
                className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-colors text-left"
              >
                <p className="text-base font-semibold text-gray-900">Mitglied</p>
                <p className="text-sm text-gray-500 mt-1">Ich bin 18+ Jahre alt und möchte Mitglied werden</p>
              </a>
              <a
                href="/register?persona=guardian"
                className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-colors text-left"
              >
                <p className="text-base font-semibold text-gray-900">Erziehungsberechtigte/r</p>
                <p className="text-sm text-gray-500 mt-1">Ich möchte Kinder oder Jugendliche anmelden</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (persona !== "member" && persona !== "guardian") redirect("/register");

  // Schritt 2: Login / E-Mail Formular
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coalita</h1>
          <p className="mt-2 text-gray-500">Mitgliedschaft beantragen</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-blue-600" />
          <div className="flex-1 h-1.5 rounded-full bg-gray-200" />
        </div>

        <div className="mb-4">
          <a href="/register" className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Zurück
          </a>
          <p className="mt-2 text-sm text-gray-500">
            {persona === "member" ? "Registrierung als Mitglied" : "Registrierung als Erziehungsberechtigte/r"}
          </p>
        </div>

        <RegisterForm persona={persona as "member" | "guardian"} />
      </div>
    </div>
  );
}
