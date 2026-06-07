"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Coalita
        </h1>
        <p className="text-gray-500 text-sm">Vereinsverwaltung für moderne Clubs</p>
        <button
          onClick={() => signIn("zitadel", { callbackUrl: "/members" })}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Mit Zitadel anmelden
        </button>
      </div>
    </div>
  );
}
