import { LogOut, Menu, Search, UserCircle2 } from "lucide-react";

export default function Header({ title, subtitle, onMenuClick, onLogout }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200/80 bg-white/70 px-4 py-4 backdrop-blur md:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-sm text-slate-500">{subtitle}</p>
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search papers, users, reviewers"
            className="w-full border-none bg-transparent p-0 text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-left text-sm text-white shadow-panel">
            <UserCircle2 size={20} />
            <span>
              <strong className="block font-semibold">Admin Panel</strong>
              <span className="text-slate-300">Authenticated session</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
