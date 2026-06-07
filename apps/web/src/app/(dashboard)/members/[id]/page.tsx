import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@coalita/ui";
import { getMember, getMemberFees } from "@/lib/members";

interface MemberDetailPageProps {
  params: { id: string };
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const [member, fees] = await Promise.all([
    getMember(params.id),
    getMemberFees(params.id),
  ]);

  if (!member) notFound();

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
              <h2 className="text-2xl font-bold text-gray-900">
                {member.first_name} {member.last_name}
              </h2>
              <p className="text-sm font-mono text-gray-400 mt-1">
                {member.membership_number}
              </p>
            </div>
            <Badge status={member.status} />
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
          </dl>
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
