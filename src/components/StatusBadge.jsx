const tones = {
  Accepted: "bg-emerald-50 text-emerald-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Active: "bg-emerald-50 text-emerald-700",
  Automated: "bg-cyan-50 text-cyan-700",
  Scheduled: "bg-amber-50 text-amber-700",
  Draft: "bg-slate-100 text-slate-700",
  Submitted: "bg-slate-100 text-slate-700",
  "Under Review": "bg-sky-50 text-sky-700",
  Revision: "bg-amber-50 text-amber-700",
  Pending: "bg-amber-50 text-amber-700",
  Watch: "bg-amber-50 text-amber-700",
  Overdue: "bg-rose-50 text-rose-700",
  Blocked: "bg-rose-50 text-rose-700",
  "On Track": "bg-emerald-50 text-emerald-700",
  Keynote: "bg-cyan-50 text-cyan-700",
  Technical: "bg-violet-50 text-violet-700",
  Panel: "bg-orange-50 text-orange-700",
  Poster: "bg-slate-100 text-slate-700",
};

export default function StatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[value] || "bg-slate-100 text-slate-700"}`}>
      {value}
    </span>
  );
}
