"use client";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({
  title = "Animeverse",
  subtitle = "ACM USAR",
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 shadow-2xl shadow-purple-500/10">
      <div className="flex justify-between items-center text-sm">
        <span className="text-purple-300 font-semibold tracking-wide">
          {title}
        </span>
        <span className="text-amber-400 font-bold">{subtitle}</span>
      </div>
    </header>
  );
}
