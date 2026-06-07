"use client";

import { useState } from "react";
import Link from "next/link";
import { createMemberFromForm } from "@/lib/members";

type AdultOption = { id: string; first_name: string; last_name: string; email: string };

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function NewMemberForm({ adults }: { adults: AdultOption[] }) {
  const [isMinor, setIsMinor] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [ageError, setAgeError] = useState("");

  function handleBirthDateChange(value: string) {
    setBirthDate(value);
    setAgeError("");
    if (!value || isMinor) return;
    const dob = new Date(value);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (dob > cutoff) {
      setAgeError("Diese Person ist minderjährig. Bitte als Jugendmitglied erfassen.");
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Neues Mitglied</h2>
      <p className="text-sm text-gray-500 mb-8">
        Nur Erwachsene (18+) können als Mitglied erfasst werden. Jugendliche werden mit einem Erziehungsberechtigten verknüpft.
      </p>

      {/* Persona toggle */}
      <div className="flex gap-3 mb-8">
        <button
          type="button"
          onClick={() => { setIsMinor(false); setAgeError(""); }}
          className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
            !isMinor
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          Erwachsenes Mitglied (18+)
        </button>
        <button
          type="button"
          onClick={() => { setIsMinor(true); setAgeError(""); }}
          className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
            isMinor
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          Jugendmitglied (unter 18)
        </button>
      </div>

      <form action={createMemberFromForm} className="space-y-6">
        <input type="hidden" name="is_minor" value={isMinor ? "1" : ""} />

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

        {/* E-Mail — optional for minors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail {!isMinor && <span className="text-red-500">*</span>}
            {isMinor && <span className="text-gray-400 font-normal"> (optional bei Jugendlichen)</span>}
          </label>
          <input
            type="email"
            name="email"
            required={!isMinor}
            defaultValue={isMinor ? "noreply@placeholder.invalid" : ""}
            className={inputCls}
          />
        </div>

        {/* Telefon & Geburtsdatum */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="tel" name="phone" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geburtsdatum {isMinor && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              name="birth_date"
              required={isMinor}
              value={birthDate}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              className={`${inputCls} ${ageError ? "border-red-400 ring-1 ring-red-400" : ""}`}
            />
            {ageError && (
              <p className="mt-1 text-xs text-red-600">{ageError}</p>
            )}
          </div>
        </div>

        {/* Guardian section — only for minors */}
        {isMinor && (
          <fieldset className="border border-amber-200 bg-amber-50 rounded-lg p-4">
            <legend className="text-sm font-medium text-amber-800 px-1">Erziehungsberechtigte/r</legend>
            <div className="space-y-3 mt-2">
              {adults.length > 0 ? (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Erziehungsberechtigte/r auswählen <span className="text-red-500">*</span>
                  </label>
                  <select name="guardian_id" required className={inputCls}>
                    <option value="">— bitte auswählen —</option>
                    {adults.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.last_name} {a.first_name} ({a.email})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Nicht dabei?{" "}
                    <Link href="/members/new" className="text-blue-600 hover:underline">
                      Zuerst den/die Erziehungsberechtigte/n als Mitglied erfassen.
                    </Link>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-amber-700">
                  Noch keine erwachsenen Mitglieder vorhanden.{" "}
                  <Link href="/members/new" className="font-medium underline">
                    Zuerst den/die Erziehungsberechtigte/n erfassen.
                  </Link>
                </p>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Beziehung</label>
                <select name="relationship" className={inputCls}>
                  <option value="Erziehungsberechtigte/r">Erziehungsberechtigte/r</option>
                  <option value="Mutter">Mutter</option>
                  <option value="Vater">Vater</option>
                  <option value="Grossmutter">Grossmutter</option>
                  <option value="Grossvater">Grossvater</option>
                  <option value="Vormund">Vormund</option>
                </select>
              </div>
            </div>
          </fieldset>
        )}

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mitgliedschaftstyp</label>
          <select name="status" defaultValue="active" className={inputCls}>
            <option value="active">Aktiv</option>
            <option value="passive">Passiv</option>
            <option value="honorary">Ehrenmitglied</option>
            <option value="resigned">Ausgetreten</option>
          </select>
        </div>

        {/* Adresse */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-medium text-gray-700 px-1">Adresse</legend>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Strasse</label>
              <input type="text" name="street" className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">PLZ</label>
                <input type="text" name="zip" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Ort</label>
                <input type="text" name="city" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Land</label>
              <input type="text" name="country" defaultValue="CH" className={inputCls} />
            </div>
          </div>
        </fieldset>

        {/* Notizen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <textarea name="notes" rows={2} className={inputCls} />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!!ageError}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mitglied anlegen
          </button>
          <Link
            href="/members"
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}
