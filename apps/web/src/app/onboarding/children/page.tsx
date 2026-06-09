import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/session";
import { getOnboardingGuardianName } from "@/lib/onboarding";
import ChildrenForm from "./ChildrenForm";

export default async function OnboardingChildrenPage({
  searchParams,
}: {
  searchParams: { added?: string };
}) {
  const { userId, hasProfile } = await requireProfile();
  if (!userId) redirect("/login");
  if (!hasProfile) redirect("/onboarding");

  const guardianName = await getOnboardingGuardianName();
  const justAdded = searchParams.added === "1";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coalita</h1>
          <p className="mt-2 text-gray-500">Kinder/Jugendliche erfassen</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-blue-600" />
          <div className="flex-1 h-1.5 rounded-full bg-blue-600" />
        </div>

        {justAdded && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Kind wurde erfolgreich hinzugefügt.
          </div>
        )}

        <ChildrenForm guardianName={guardianName} />
      </div>
    </div>
  );
}
