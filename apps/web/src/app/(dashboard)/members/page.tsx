import Link from "next/link";
import { Badge } from "@coalita/ui";
import { MemberStatus } from "@coalita/db";

const mockMembers = [
  {
    id: "1",
    membership_number: "M-0001",
    first_name: "Anna",
    last_name: "Müller",
    email: "anna.mueller@example.com",
    joined_at: "2021-03-15",
    status: MemberStatus.active,
  },
  {
    id: "2",
    membership_number: "M-0002",
    first_name: "Thomas",
    last_name: "Becker",
    email: "thomas.becker@example.com",
    joined_at: "2020-07-01",
    status: MemberStatus.passive,
  },
  {
    id: "3",
    membership_number: "M-0003",
    first_name: "Maria",
    last_name: "Schmidt",
    email: "maria.schmidt@example.com",
    joined_at: "2018-01-10",
    status: MemberStatus.honorary,
  },
];

export default function MembersPage() {
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
            {mockMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {member.membership_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.first_name} {member.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.email}
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
    </div>
  );
}
