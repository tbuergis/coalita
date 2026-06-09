import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/session";

const navItems = [
  { href: "/members", label: "Mitglieder" },
  { href: "/fees", label: "Beiträge" },
  { href: "/settings", label: "Einstellungen" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, hasProfile } = await requireProfile();

  if (!userId) redirect("/login");
  if (!hasProfile) redirect("/onboarding");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-brand-700">
          <span className="text-2xl font-extrabold tracking-tight">Coalita</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-brand-100 hover:bg-brand-700 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-brand-700 text-xs text-brand-400">
          &copy; {new Date().getFullYear()} Coalita
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Admin</span>
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
