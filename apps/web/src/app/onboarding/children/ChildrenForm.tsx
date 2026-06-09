"use client";

import Link from "next/link";
import { onboardingAddChild } from "@/lib/onboarding";

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function ChildrenForm({ guardianName }: { guardianName: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <p className="text-sm text-gray-500 mb-6">
        Erziehungsberechtigte/r: <span className="font-medium text-gray-800">{guardianName}</span>
      </p>

      <form action={onboardingAddChild} className="space-y-5">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vorname <span className="text-red-500">*</span>
            </label>
            <input type="text" name="first_name" required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nachname <span className="text-red-500">*</span>
            </label>
            <input type="text" name="last_name" required className={inputCls} />
          </div>
        </div>

        {/* Geburtsdatum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geburtsdatum <span className="text-red-500">*</span>
          </label>
          <input type="date" name="birth_date" required className={inputCls} />
        </div>

        {/* E-Mail (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail <span className="text-gray-400 font-normal">(optional — für App-Zugang)</span>
          </label>
          <input type="email" name="email" className={inputCls} />
        </div>

        {/* Beziehung */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beziehung</label>
          <select name="relationship" className={inputCls}>
            <option value="Erziehungsberechtigte/r">Erziehungsberechtigte/r</option>
            <option value="Mutter">Mutter</option>
            <option value="Vater">Vater</option>
            <option value="Grossmutter">Grossmutter</option>
            <option value="Grossvater">Grossvater</option>
            <option value="Vormund">Vormund</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            name="add_another"
            value="1"
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Speichern und weiteres Kind hinzufügen
          </button>
          <button
            type="submit"
            name="add_another"
            value="0"
            className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Fertig — zum Dashboard
          </button>
          <Link
            href="/members"
            className="text-center text-sm text-gray-400 hover:text-gray-600"
          >
            Überspringen (keine Kinder erfassen)
          </Link>
        </div>
      </form>
    </div>
  );
}
