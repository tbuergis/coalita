import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@coalita/ui";
import { getMember, getMemberFees, getChildrenOf } from "@/lib/members";
import { getDb } from "@/lib/db";
import type { Member } from "@coalita/db";
import DeleteMemberButton from "./DeleteMemberButton";

interface MemberDetailPageProps {
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

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const [member, fees] = await Promise.all([
    getMember(params.id),
    getMemberFees(params.id),
  ]);

  if (!member) notFound();

  const [children, guardians] = await Promise.all([
    member.is_minor ? [] : getChildrenOf(params.id),
    member.is_minor ? getGuardiansOf(params.id) : [],
  ]);

  const unpaidFees = fees.filter((f) => !f.paid_at);
  const totalUnpaid = unpaidFees.reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div>
      <div className="mb-6">
        <Link href="/members" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          &larr; Zurück zu Mitglieder
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stammdaten */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {member.first_name} {member.last_name}
                </h2>
                {member.is_minor && (
                  <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Jugendmitglied
                  </span>
                )}
              </div>
              <p className="text-sm font-mono text-gray-400 mt-1">
                {member.membership_number}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={member.status} />
              <Link
                href={`/members/${member.id}/edit`}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Bearbeiten
              </Link>
              <DeleteMemberButton
                memberId={member.id}
                memberName={`${member.first_name} ${member.last_name}`}
              />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-gray-500">E-Mail</dt>
              <dd className="text-gray-900 font-medium">{member.email}</dd>
            </div>
            {member.phone && (
              <div>
                <dt className="text-gray-500">Telefon</dt>
                <dd className="text-gray-900 font-medium">{member.phone}</dd>
              </div>
            )}
            {member.birth_date && (
              <div>
                <dt className="text-gray-500">Geburtsdatum</dt>
                <dd className="text-gray-900 font-medium">
                  {new Date(member.birth_date).toLocaleDateString("de-DE")}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Eingetreten</dt>
              <dd className="text-gray-900 font-medium">
                {new Date(member.joined_at).toLocaleDateString("de-DE")}
              </dd>
            </div>
            {member.address && (
              <div className="col-span-2">
                <dt className="text-gray-500">Adresse</dt>
                <dd className="text-gray-900 font-medium">
                  {member.address.street}, {member.address.zip} {member.address.city}
                </dd>
              </div>
            )}
            {member.notes && (
              <div className="col-span-2">
                <dt className="text-gray-500">Notizen</dt>
                <dd className="text-gray-900">{member.notes}</dd>
              </div>
            )}
          </dl>

          {/* Erziehungsberechtigte (bei Jugendlichen) */}
          {guardians.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Erziehungsberechtigte</h3>
              <ul className="space-y-2">
                {guardians.map((g) => (
                  <li key={g.id} className="flex items-center justify-between text-sm">
                    <Link href={`/members/${g.id}`} className="text-blue-600 hover:underline font-medium">
                      {g.last_name} {g.first_name}
                    </Link>
                    <span className="text-gray-400">{g.relationship}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Kinder/Jugendliche (bei Erziehungsberechtigten) */}
          {children.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Jugendmitglieder</h3>
              <ul className="space-y-2">
                {children.map((c) => (
                  <li key={c.id}>
                    <Link href={`/members/${c.id}`} className="text-sm text-blue-600 hover:underline font-medium">
                      {c.last_name} {c.first_name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Beitrags-Übersicht */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Beiträge</h3>
          {unpaidFees.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                Offen: CHF {totalUnpaid.toFixed(2)}
              </p>
            </div>
          )}
          {fees.length === 0 ? (
            <p className="text-sm text-gray-400">Keine Beiträge vorhanden.</p>
          ) : (
            <ul className="space-y-2">
              {fees.map((fee) => (
                <li key={fee.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(fee.due_date).toLocaleDateString("de-DE")}
                  </span>
                  <span className={`font-medium ${fee.paid_at ? "text-green-600" : "text-red-600"}`}>
                    CHF {Number(fee.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
