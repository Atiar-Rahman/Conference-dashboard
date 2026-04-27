import { ArrowUpRight, Plus } from "lucide-react";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { kpis, notices, payments, reviewers, schedule, submissions, tracks } from "../data/dashboard";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[32px] bg-ink p-6 text-white shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">Admin control center</p>
              <h3 className="mt-2 max-w-xl text-3xl font-semibold">
                Coordinate the full DUET conference workflow, from paper intake to final publication.
              </h3>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              Launch review round
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <StatCard key={item.label} {...item} />
            ))}
          </div>
        </div>

        <SectionCard
          title="Quick actions"
          action={
            <button className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              <Plus size={16} />
              New event
            </button>
          }
        >
          <div className="grid gap-3 text-sm">
            {[
              "Assign reviewers to newly submitted papers",
              "Update the submission deadline and camera-ready date",
              "Publish accepted papers and schedule sessions",
              "Send payment reminders to pending registrants",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Latest submissions">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Paper</th>
                  <th className="pb-3 font-medium">Track</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Reviewers</th>
                  <th className="pb-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((paper) => (
                  <tr key={paper.id} className="border-t border-slate-100">
                    <td className="py-4">
                      <p className="font-semibold text-slate-900">{paper.title}</p>
                      <p className="text-slate-500">
                        {paper.id} • {paper.author}
                      </p>
                    </td>
                    <td className="py-4 text-slate-600">{paper.track}</td>
                    <td className="py-4">
                      <StatusBadge value={paper.status} />
                    </td>
                    <td className="py-4 text-slate-600">{paper.reviewers}</td>
                    <td className="py-4 text-slate-600">{paper.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Notification queue">
            <div className="space-y-3">
              {notices.map((notice) => (
                <div key={notice.title} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{notice.title}</p>
                    <p className="text-sm text-slate-500">{notice.audience}</p>
                  </div>
                  <StatusBadge value={notice.status} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Registration payments">
            <div className="space-y-3">
              {payments.map((item) => (
                <div key={item.registrant} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.registrant}</p>
                    <p className="text-sm text-slate-500">
                      {item.amount} • {item.method}
                    </p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Reviewer workload">
          <div className="space-y-4">
            {reviewers.map((reviewer) => (
              <div key={reviewer.name} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{reviewer.name}</p>
                    <p className="text-sm text-slate-500">{reviewer.expertise}</p>
                  </div>
                  <StatusBadge value={reviewer.risk} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-3">Assigned: {reviewer.assigned}</div>
                  <div className="rounded-2xl bg-slate-50 p-3">Completion: {reviewer.completion}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Conference tracks and sessions">
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {tracks.map((track) => (
                <div key={track.name} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{track.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{track.chair}</p>
                  <p className="mt-3 text-sm text-slate-700">{track.submissions} submissions</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.session} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.session}</p>
                    <p className="text-sm text-slate-500">
                      {item.time} • {item.room}
                    </p>
                  </div>
                  <StatusBadge value={item.type} />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
