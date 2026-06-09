import Link from "next/link";
import { Badge } from "@coalita/ui";
import { getMembers } from "@/lib/members";

export default async function MembersPage() {
  const members = await getMembers();

  const adults = members.filter((m) => !m.is_minor);
  const minors = members.filter((m) => m.is_minor);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mitglieder</h2>
        <Link
          href="/members/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          + Neues Mitglied
        </Link>
      </div>

      {/* Summary chips */}
      {members.length > 0 && (
        <div className="flex gap-3 mb-6">
          <span className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
            {members.length} Mitglieder total
          </span>
          <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full">
            {adults.length} Erwachsene
          </span>
          <span className="text-sm px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
            {minors.length} Jugendliche
          </span>
        </div>
      )}

      {members.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500">Noch keine Mitglieder vorhanden.</p>
          <Link
            href="/members/new"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Erstes Mitglied anlegen
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-Mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eingetreten
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {member.membership_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </span>
                      {member.is_minor && (
                        <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Jugend
                        </span>
                      )}
                      {!member.can_login && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          kein Login
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.email.includes("@noemail.coalita.local") ? (
                      <span className="text-gray-300 italic">—</span>
                    ) : (
                      member.email
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joined_at).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={member.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/members/${member.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
