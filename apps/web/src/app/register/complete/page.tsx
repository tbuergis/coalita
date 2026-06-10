import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMember } from "@/lib/members";
import { getCurrentUserId } from "@/lib/session";
import CompleteRegistrationForm from "./CompleteRegistrationForm";

export default async function RegisterCompletePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const existing = await getMember(userId);
  if (existing) redirect("/members");

  const session = await getServerSession(authOptions);
  const user = session?.user as { name?: string; email?: string } | undefined;

  const nameParts = (user?.name ?? "").split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";
  const email = user?.email ?? "";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coalita</h1>
          <p className="mt-2 text-gray-500">Profil vervollständigen</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-blue-600" />
          <div className="flex-1 h-1.5 rounded-full bg-gray-200" />
        </div>

        <CompleteRegistrationForm
          defaultFirstName={firstName}
          defaultLastName={lastName}
          email={email}
        />
      </div>
    </div>
  );
}
