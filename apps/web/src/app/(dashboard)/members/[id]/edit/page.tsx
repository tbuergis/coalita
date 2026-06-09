import Link from "next/link";
import { notFound } from "next/navigation";
import { getMember, getAdultMembers } from "@/lib/members";
import { getDb } from "@/lib/db";
import type { Member } from "@coalita/db";
import EditMemberForm from "./EditMemberForm";

interface Props {
  params: { id: string };
}

async function getGuardiansOf(childId: string): Promise<(Pick<Member, "id" | "first_name" | "last_name"> & { relationship: string })[]> {
  const db = getDb();
  const result = await db.query<Pick<Member, "id" | "first_name" | "last_name"> & { relationship: string }>(
    `SELECT p.id, p.first_name, p.last_name, g.relationship
     FROM profiles p
     JOIN guardians g ON g.guardian_id = p.id
     WHERE g.child_id = $1`,
    [childId]
  );
  return result.rows;
}

export default async function EditMemberPage({ params }: Props) {
  const member = await getMember(params.id);
  if (!member) notFound();

  const [adults, guardians] = await Promise.all([
    member.is_minor ? getAdultMembers() : Promise.resolve([]),
    member.is_minor ? getGuardiansOf(params.id) : Promise.resolve([]),
  ]);

  return (
    <div>
      <div className="mb-6">
        <Link href={`/members/${params.id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          &larr; Zurück zu {member.first_name} {member.last_name}
        </Link>
      </div>
      <EditMemberForm member={member} adults={adults} guardians={guardians} />
    </div>
  );
}
