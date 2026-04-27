import { notices } from "../data/dashboard";
import SectionCard from "../components/SectionCard";
import StatusBadge from "../components/StatusBadge";

export default function NotificationsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <SectionCard title="Email automation">
        <div className="space-y-4 text-sm text-slate-700">
          <div className="rounded-2xl bg-slate-50 p-4">
            SMTP integration is ready to connect for submission confirmation, review alerts, and acceptance decisions.
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            Delivery health: <strong className="text-slate-950">98.2%</strong>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            Failed queue: <strong className="text-slate-950">04 emails</strong>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notification templates">
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.title} className="rounded-[24px] border border-slate-100 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{notice.title}</p>
                  <p className="text-sm text-slate-500">{notice.audience}</p>
                </div>
                <StatusBadge value={notice.status} />
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Template variables are ready for conference name, paper title, decision, payment status, and session details.
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
