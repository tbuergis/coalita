"use client";

import { useState } from "react";
import { onboardingCreateProfile } from "@/lib/onboarding";

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function calcAge(dateStr: string): number | null {
  if (!dateStr) return null;
  const dob = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export default function OnboardingForm() {
  const [persona, setPersona] = useState<"member" | "guardian" | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [ageError, setAgeError] = useState("");

  function handleBirthDate(value: string) {
    setBirthDate(value);
    setAgeError("");
    if (!value || persona === "guardian") return;
    const age = calcAge(value);
    if (age !== null && age < 18) {
      setAgeError("Als Mitglied müssen Sie mindestens 18 Jahre alt sein. Falls Sie ein Kind anmelden möchten, wählen Sie 'Erziehungsberechtigte/r'.");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

      {/* Persona choice */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Ich registriere mich als…</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setPersona("member"); setAgeError(""); }}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              persona === "member"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-sm font-semibold text-gray-900">Mitglied</p>
            <p className="text-xs text-gray-500 mt-1">Ich bin 18+ Jahre alt</p>
          </button>
          <button
            type="button"
            onClick={() => { setPersona("guardian"); setAgeError(""); }}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              persona === "guardian"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-sm font-semibold text-gray-900">Erziehungsberechtigte/r</p>
            <p className="text-xs text-gray-500 mt-1">Ich melde Kinder/Jugendliche an</p>
          </button>
        </div>
      </div>

      {persona && (
        <form action={onboardingCreateProfile} className="space-y-5">
          <input type="hidden" name="persona" value={persona} />

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
            <input
              type="date"
              name="birth_date"
              required
              value={birthDate}
              onChange={(e) => handleBirthDate(e.target.value)}
              className={`${inputCls} ${ageError ? "border-red-400" : ""}`}
            />
            {ageError && <p className="mt-1 text-xs text-red-600">{ageError}</p>}
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="tel" name="phone" className={inputCls} />
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

          <button
            type="submit"
            disabled={!!ageError}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {persona === "guardian" ? "Weiter → Kinder erfassen" : "Registrierung abschliessen"}
          </button>
        </form>
      )}
    </div>
  );
}
