import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-blue-100">
      <div className="text-center max-w-xl px-4">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white text-3xl font-bold shadow-lg">
            C
          </span>
        </div>
        <h1 className="text-5xl font-extrabold text-brand-900 mb-3 tracking-tight">
          Coalita
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Vereinsverwaltung für moderne Clubs
        </p>
        <Link
          href="/members"
          className="inline-block px-8 py-3 bg-brand-600 text-white text-lg font-semibold rounded-xl shadow hover:bg-brand-700 transition-colors"
        >
          Anmelden
        </Link>
      </div>
    </main>
  );
}
