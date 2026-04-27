import {
  LogOut,
  Menu,
  Search,
  UserCircle2,
} from "lucide-react";

const Header = ({
  title,
  subtitle,
  auth,
  onMenuClick,
  onLogout,
}) => {
  const userName =
    auth?.user?.first_name && auth?.user?.last_name
      ? `${auth.user.first_name} ${auth.user.last_name}`
      : auth?.email || "Admin Panel";

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200/80 bg-white/70 px-4 py-4 backdrop-blur md:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <button
          onClick={onMenuClick}
          className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 lg:hidden"
        >
          <Menu size={18} />
        </button>

        <div>
          <p className="text-sm text-slate-500">{subtitle}</p>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent outline-none"
          />
        </label>

        <div className="inline-flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white">
          <UserCircle2 size={20} />
          <span>{userName}</span>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;