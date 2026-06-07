"use client";

import { useState } from "react";
import Link from "next/link";
import { createMemberFromForm } from "@/lib/members";

type AdultOption = { id: string; first_name: string; last_name: string; email: string };

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

export default function NewMemberForm({ adults }: { adults: AdultOption[] }) {
  const [birthDate, setBirthDate] = useState("");
  const [canLogin, setCanLogin] = useState(false);

  const age = calcAge(birthDate);
  const isMinor = age !== null && age < 18;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Neues Mitglied</h2>

      <form action={createMemberFromForm} className="space-y-6">

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

        {/* Geburtsdatum — zentral, steuert alles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geburtsdatum <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="date"
              name="birth_date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={`${inputCls} max-w-[200px]`}
            />
            {age !== null && (
              <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                isMinor
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {age} Jahre {isMinor ? "· Jugendmitglied" : "· Erwachsen"}
              </span>
            )}
          </div>
        </div>

        {/* E-Mail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail{" "}
            {!isMinor && <span className="text-red-500">*</span>}
            {isMinor && (
              <span className="text-gray-400 font-normal"> (optional — für App-Konto benötigt)</span>
            )}
          </label>
          <input
            type="email"
            name="email"
            required={!isMinor}
            className={inputCls}
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input type="tel" name="phone" className={inputCls} />
        </div>

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

        {/* Jugendmitglied-Bereich — erscheint automatisch */}
        {isMinor && (
          <fieldset className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-4">
            <legend className="text-sm font-semibold text-amber-800 px-1">Erziehungsberechtigte/r</legend>

            {adults.length > 0 ? (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Person auswählen <span className="text-red-500">*</span>
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
                    Nicht aufgeführt?{" "}
                    <Link href="/members/new" className="text-blue-600 hover:underline">
                      Erziehungsberechtigte/n zuerst erfassen.
                    </Link>
                  </p>
                </div>
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
              </>
            ) : (
              <p className="text-sm text-amber-700">
                Noch keine erwachsenen Mitglieder vorhanden.{" "}
                <Link href="/members/new" className="font-medium underline">
                  Zuerst den/die Erziehungsberechtigte/n erfassen.
                </Link>
              </p>
            )}

            {/* App-Zugang für Kind */}
            <div className="border-t border-amber-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                App-Zugang für dieses Mitglied
              </label>
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
                    <p className="text-xs text-gray-500">Wird über die Erziehungsberechtigten verwaltet</p>
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
                    <p className="text-xs text-gray-500">Mitglied hat ein Mobiltelefon und kann die App selbst nutzen</p>
                  </div>
                </label>
              </div>
              {canLogin && (
                <label className="mt-3 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" name="send_invite" value="1" className="rounded" />
                  Einladungs-E-Mail senden
                </label>
              )}
            </div>
          </fieldset>
        )}

        {/* Notizen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <textarea name="notes" rows={2} className={inputCls} />
        </div>

        {/* Zitadel-Einladung für Erwachsene */}
        {!isMinor && age !== null && (
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="send_invite" value="1" defaultChecked className="rounded" />
            Einladungs-E-Mail senden (Zitadel-Konto aktivieren)
          </label>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
