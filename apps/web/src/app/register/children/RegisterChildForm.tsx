"use client";

import { useState } from "react";
import { registerChild } from "@/lib/registration";

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function RegisterChildForm({ guardianId }: { guardianId: string }) {
  const [canLogin, setCanLogin] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <form action={registerChild} className="space-y-5">
        <input type="hidden" name="guardian_id" value={guardianId} />

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

        {/* App-Zugang */}
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
          <p className="text-sm font-medium text-amber-800 mb-3">App-Zugang für dieses Kind</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="can_login"
                value="0"
                checked={!canLogin}
                onChange={() => setCanLogin(false)}
                className="accent-amber-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Kein eigener App-Zugang</span>
                <p className="text-xs text-gray-500">Wird über mich verwaltet</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="can_login"
                value="1"
                checked={canLogin}
                onChange={() => setCanLogin(true)}
                className="accent-amber-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Eigener App-Zugang</span>
                <p className="text-xs text-gray-500">Kind hat ein Mobiltelefon</p>
              </div>
            </label>
          </div>

          {canLogin && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail des Kindes <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" required={canLogin} className={inputCls} />
            </div>
          )}
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
            Fertig — Registrierung abschliessen
          </button>
        </div>
      </form>
    </div>
  );
}
