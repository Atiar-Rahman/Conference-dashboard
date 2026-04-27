export default function SectionCard({ title, action, children }) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
