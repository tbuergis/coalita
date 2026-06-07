import Link from "next/link";

interface MemberDetailPageProps {
  params: { id: string };
}

export default function MemberDetailPage({ params }: MemberDetailPageProps) {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/members"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Zurück zu Mitglieder
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Mitglied Details
        </h2>
        <p className="text-gray-500 text-sm">ID: {params.id}</p>
        <p className="mt-6 text-gray-600">
          Diese Seite wird in Kürze mit den vollständigen Mitgliedsdaten befüllt.
        </p>
      </div>
    </div>
  );
}
