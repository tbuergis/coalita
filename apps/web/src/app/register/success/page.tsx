import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Registrierung erfolgreich!</h2>
          <p className="text-gray-500 mb-2">
            Sie erhalten in Kürze eine Einladungs-E-Mail um Ihr Konto zu aktivieren.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Bitte prüfen Sie auch Ihren Spam-Ordner.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}
