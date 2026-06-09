import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/session";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId, hasProfile } = await requireProfile();
  if (!userId) redirect("/login");
  if (hasProfile) redirect("/members");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coalita</h1>
          <p className="mt-2 text-gray-500">Willkommen! Bitte vervollständigen Sie Ihr Profil.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-blue-600" />
          <div className="flex-1 h-1.5 rounded-full bg-gray-200" />
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}
