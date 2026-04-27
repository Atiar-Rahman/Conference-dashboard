import { CreditCard, Wallet } from "lucide-react";
import SectionCard from "../components/SectionCard";
import StatusBadge from "../components/StatusBadge";
import { payments } from "../data/dashboard";

export default function PaymentsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard title="Registration fees">
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.registrant} className="rounded-[24px] border border-slate-100 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{payment.registrant}</p>
                  <p className="text-sm text-slate-500">{payment.method}</p>
                </div>
                <StatusBadge value={payment.status} />
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Conference registration fee: {payment.amount}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard title="Gateway status">
          <div className="grid gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-cyan-600" />
                <div>
                  <p className="font-semibold text-slate-900">SSLCommerz</p>
                  <p className="text-sm text-slate-500">Primary gateway for local payments</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Wallet size={18} className="text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">Bank transfer</p>
                  <p className="text-sm text-slate-500">Manual verification enabled</p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Finance summary">
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">Collected: $14,520</div>
            <div className="rounded-2xl bg-slate-50 p-4">Pending: $2,040</div>
            <div className="rounded-2xl bg-slate-50 p-4">Refund requests: 2</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
