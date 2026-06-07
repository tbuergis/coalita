import Link from "next/link";
import { getAdultMembers } from "@/lib/members";
import NewMemberForm from "./NewMemberForm";

export default async function NewMemberPage() {
  const adults = await getAdultMembers();
  return (
    <div>
      <div className="mb-6">
        <Link href="/members" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          &larr; Zurück zu Mitglieder
        </Link>
      </div>
      <NewMemberForm adults={adults} />
    </div>
  );
}
