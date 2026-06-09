"use client";

import Link from "next/link";
import { updateMemberFromForm, setMemberCanLogin, addGuardianFromForm } from "@/lib/members";
import type { Member } from "@coalita/db";

type AdultOption = { id: string; first_name: string; last_name: string; email: string };
type GuardianOption = { id: string; first_name: string; last_name: string; relationship: string };

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

interface Props {
  member: Member;
  adults: AdultOption[];
  guardians: GuardianOption[];
}

export default function EditMemberForm({ member, adults, guardians }: Props) {
  const address = member.address as { street?: string; zip?: string; city?: string; country?: string } | null;
  const birthDate = member.birth_date
    ? String(member.birth_date).slice(0, 10)
    : "";
  const hasRealEmail = !member.email.includes("@noemail.coalita.local");

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {member.first_name} {member.last_name} bearbeiten
      </h2>
      <p className="text-sm font-mono text-gray-400 mb-8">{member.membership_number}</p>

      <form action={updateMemberFromForm} className="space-y-6">
        <input type="hidden" name="id" value={member.id} />

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vorname <span className="text-red-500">*</span>
            </label>
            <input type="text" name="first_name" required defaultValue={member.first_name} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nachname <span className="text-red-500">*</span>
            </label>
            <input type="text" name="last_name" required defaultValue={member.last_name} className={inputCls} />
          </div>
        </div>

        {/* E-Mail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail {!member.is_minor && <span className="text-red-500">*</span>}
          </label>
          <input
            type="email"
            name="email"
            required={!member.is_minor}
            defaultValue={hasRealEmail ? member.email : ""}
            placeholder={member.is_minor ? "optional" : ""}
            className={inputCls}
          />
        </div>

        {/* Telefon & Geburtsdatum */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="tel" name="phone" defaultValue={member.phone ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
            <input type="date" name="birth_date" defaultValue={birthDate} className={inputCls} />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mitgliedschaftstyp</label>
          <select name="status" defaultValue={member.status} className={inputCls}>
            <option value="active">Aktiv</option>
            <option value="passive">Passiv</option>
            <option value="honorary">Ehrenmitglied</option>
            <option value="resigned">Ausgetreten</option>
          </select>
        </div>

        {/* App-Zugang (nur bei Jugendlichen) */}
        {member.is_minor && (
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-800 mb-3">App-Zugang</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {member.can_login ? "Eigener App-Zugang aktiv" : "Kein eigener App-Zugang"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {member.can_login
                    ? "Mitglied kann sich selbst einloggen"
                    : "Wird über Erziehungsberechtigte verwaltet"}
                </p>
              </div>
              <form action={setMemberCanLogin.bind(null, member.id, !member.can_login)}>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    member.can_login
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  {member.can_login ? "Deaktivieren" : "Aktivieren"}
                </button>
              </form>
            </div>

            {/* Guardians */}
            {guardians.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-xs font-medium text-amber-800 mb-2">Erziehungsberechtigte</p>
                <ul className="space-y-1">
                  {guardians.map((g) => (
                    <li key={g.id} className="flex items-center justify-between text-sm">
                      <Link href={`/members/${g.id}`} className="text-blue-600 hover:underline">
                        {g.last_name} {g.first_name}
                      </Link>
                      <span className="text-gray-400 text-xs">{g.relationship}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add guardian — separate form so it submits independently */}
            {adults.filter((a) => !guardians.find((g) => g.id === a.id)).length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-xs font-medium text-amber-800 mb-2">Erziehungsberechtigte/n hinzufügen</p>
                <form action={addGuardianFromForm} className="flex flex-col gap-2">
                  <input type="hidden" name="child_id" value={member.id} />
                  <select name="guardian_id" required className={inputCls}>
                    <option value="">— Person auswählen —</option>
                    {adults
                      .filter((a) => !guardians.find((g) => g.id === a.id))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.last_name} {a.first_name}
                        </option>
                      ))}
                  </select>
                  <select name="relationship" className={inputCls}>
                    <option value="Erziehungsberechtigte/r">Erziehungsberechtigte/r</option>
                    <option value="Mutter">Mutter</option>
                    <option value="Vater">Vater</option>
                    <option value="Grossmutter">Grossmutter</option>
                    <option value="Grossvater">Grossvater</option>
                    <option value="Vormund">Vormund</option>
                  </select>
                  <button
                    type="submit"
                    className="self-start px-4 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Hinzufügen
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Adresse */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-medium text-gray-700 px-1">Adresse</legend>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Strasse</label>
              <input type="text" name="street" defaultValue={address?.street ?? ""} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">PLZ</label>
                <input type="text" name="zip" defaultValue={address?.zip ?? ""} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Ort</label>
                <input type="text" name="city" defaultValue={address?.city ?? ""} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Land</label>
              <input type="text" name="country" defaultValue={address?.country ?? "CH"} className={inputCls} />
            </div>
          </div>
        </fieldset>

        {/* Notizen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <textarea name="notes" rows={3} defaultValue={member.notes ?? ""} className={inputCls} />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Speichern
          </button>
          <Link
            href={`/members/${member.id}`}
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}
