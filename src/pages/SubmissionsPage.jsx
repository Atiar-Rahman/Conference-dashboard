import { Download, Filter, Plus } from "lucide-react";
import SectionCard from "../components/SectionCard";
import StatusBadge from "../components/StatusBadge";
import { submissions } from "../data/dashboard";

export default function SubmissionsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
      <SectionCard
        title="Paper submissions"
        action={
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              <Filter size={16} />
              Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              <Plus size={16} />
              Add paper
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {submissions.map((paper) => (
            <div key={paper.id} className="rounded-[24px] border border-slate-100 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-950">{paper.title}</h3>
                    <StatusBadge value={paper.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {paper.id} • {paper.author} • {paper.track}
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                  <Download size={16} />
                  PDF
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Assigned reviewers: {paper.reviewers}</div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Last update: {paper.updatedAt}</div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Decision window: Open</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Submission controls">
        <div className="space-y-4 text-sm text-slate-700">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Deadline management</p>
            <p className="mt-2">Paper submission closes on May 14, 2026. Camera-ready upload closes on June 02, 2026.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Bulk operations</p>
            <p className="mt-2">Assign reviewers, export decision sheets, and send author notifications.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Status overview</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Submitted", "Under Review", "Accepted", "Revision"].map((value) => (
                <StatusBadge key={value} value={value} />
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
