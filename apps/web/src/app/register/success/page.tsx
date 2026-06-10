import Link from "next/link";

export default function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: { persona?: string };
}) {
  const persona = searchParams.persona ?? "member";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">E-Mail unterwegs!</h2>
          <p className="text-gray-500 mb-2">
            Sie erhalten in Kürze eine Einladungs-E-Mail. Klicken Sie auf den Link darin, um Ihr Konto zu aktivieren und Ihr Profil zu vervollständigen.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Bitte prüfen Sie auch Ihren Spam-Ordner.
          </p>
          <Link
            href={`/login?callbackUrl=/register/complete?persona=${persona}`}
            className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}
