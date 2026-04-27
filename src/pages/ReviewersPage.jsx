import { reviewers, submissions } from "../data/dashboard";
import SectionCard from "../components/SectionCard";
import StatusBadge from "../components/StatusBadge";

export default function ReviewersPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard title="Reviewer performance">
        <div className="space-y-4">
          {reviewers.map((reviewer) => (
            <div key={reviewer.name} className="rounded-[24px] border border-slate-100 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{reviewer.name}</h3>
                  <p className="text-sm text-slate-500">{reviewer.expertise}</p>
                </div>
                <StatusBadge value={reviewer.risk} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Assigned papers: {reviewer.assigned}</div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Completion rate: {reviewer.completion}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Assignment board">
        <div className="space-y-4">
          {submissions.map((paper) => (
            <div key={paper.id} className="rounded-[24px] bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{paper.title}</h3>
                  <p className="text-sm text-slate-500">
                    {paper.id} • {paper.track}
                  </p>
                </div>
                <StatusBadge value={paper.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {reviewers.slice(0, Math.max(paper.reviewers, 1)).map((reviewer) => (
                  <span key={`${paper.id}-${reviewer.name}`} className="rounded-full bg-white px-3 py-2 text-sm text-slate-700">
                    {reviewer.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
