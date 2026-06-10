"use client";

import { useRef } from "react";
import { deleteMember } from "@/lib/members";

export default function DeleteMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick() {
    if (confirm(`Mitglied «${memberName}» wirklich unwiderruflich löschen?`)) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={deleteMember}>
      <input type="hidden" name="id" value={memberId} />
      <button
        type="button"
        onClick={handleClick}
        className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
      >
        Löschen
      </button>
    </form>
  );
}
