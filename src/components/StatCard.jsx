export default function StatCard({ label, value, delta, tone }) {
  const accents = {
    cyan: "from-cyan/15 to-cyan/5 text-cyan-700",
    mint: "from-mint/15 to-mint/5 text-emerald-700",
    gold: "from-gold/15 to-gold/5 text-amber-700",
    coral: "from-coral/15 to-coral/5 text-orange-700",
  };

  return (
    <div className={`rounded-[24px] border border-white/60 bg-gradient-to-br ${accents[tone]} p-5 shadow-panel`}>
      <p className="text-sm text-slate-600">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <h3 className="text-3xl font-semibold text-slate-950">{value}</h3>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">{delta}</span>
      </div>
    </div>
  );
}
