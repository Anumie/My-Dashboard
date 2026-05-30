"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutGrid,
  BookOpen,
  Star,
  TrendingUp,
  Briefcase,
  CheckSquare,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "This Week", href: "/", icon: CalendarDays },
  { label: "Habits", href: "/habits", icon: CheckSquare },
  { label: "Quarter", href: "/quarter", icon: TrendingUp },
  { label: "Books", href: "/books", icon: BookOpen },
  { label: "Bucket List", href: "/bucket-list", icon: Star },
  { label: "Yearly", href: "/yearly", icon: LayoutGrid },
  { label: "Portfolio", href: "/portfolio", icon: Briefcase },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col border-r border-stone-200/70 z-40"
      style={{ background: "linear-gradient(180deg, #f7edd8 0%, #fdf6ec 100%)" }}
    >
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-stone-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-700 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-cream" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-700 leading-tight">My Dashboard</p>
            <p className="text-[10px] text-stone-400 leading-tight">personal space</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
                isActive
                  ? "bg-stone-700 text-cream shadow-sm"
                  : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-800"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-cream" : "text-stone-400 group-hover:text-stone-600"
                )}
              />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-stone-200/60">
        <Link
          href="/portfolio/public"
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          → Public Portfolio
        </Link>
      </div>
    </aside>
  );
}
