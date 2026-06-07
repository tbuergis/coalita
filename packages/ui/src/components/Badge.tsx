import React from "react";
import { MemberStatus } from "@coalita/db";

const statusStyles: Record<MemberStatus, string> = {
  [MemberStatus.active]: "bg-green-100 text-green-800",
  [MemberStatus.passive]: "bg-yellow-100 text-yellow-800",
  [MemberStatus.honorary]: "bg-blue-100 text-blue-800",
  [MemberStatus.resigned]: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<MemberStatus, string> = {
  [MemberStatus.active]: "Aktiv",
  [MemberStatus.passive]: "Passiv",
  [MemberStatus.honorary]: "Ehrenmitglied",
  [MemberStatus.resigned]: "Ausgetreten",
};

interface BadgeProps {
  status: MemberStatus;
  className?: string;
}

export function Badge({ status, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
