import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getConferenceRegistration,
    payConferenceRegistration,
} from "../../lib/api";

import { readStoredAuth } from "../../lib/authStorage";

/**
 * Props:
 * getRegistration(conferencePk, registrationId)
 * payRegistration(conferencePk, registrationId)
 */
const ConferenceRegistrationDashboard = () => {
    const { conferencePk, registrationId } = useParams();
    const token = readStoredAuth()?.access;

    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [registration, setRegistration] = useState(null);

    const loadRegistration = async () => {
        try {
            setLoading(true);
            const res = await getConferenceRegistration(
                conferencePk,
                registrationId,
                token
            );
            setRegistration(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRegistration();
    }, [conferencePk, registrationId]);

    const handlePayment = async () => {
        try {
            setPaying(true);

            const res = await payConferenceRegistration(
                conferencePk,
                registrationId,
                token
            );

            // যদি gateway_url আসে → redirect
            if (res?.gateway_url) {
                window.location.href = res.gateway_url;
                return;
            }

            // fallback reload
            await loadRegistration();
        } catch (error) {
            console.error(error);
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-20 text-center text-lg">
                Loading registration...
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="max-w-6xl mx-auto py-20 text-center text-red-500">
                Registration not found
            </div>
        );
    }

    const personal = registration.personal_infos || {};
    const paper = registration.paper_info || {};
    const billing = registration.billing_contact || {};
    const payments = registration.payments || [];

    const paid =
        registration.payment_status === "paid" ||
        registration.status === "paid";

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* left */}
                <div className="lg:col-span-2 space-y-6">
                    {/* status */}
                    <div className="bg-white rounded-2xl shadow p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-slate-500">Registration ID</p>
                                <h2 className="text-2xl font-bold mt-1">
                                    {registration.id}
                                </h2>
                            </div>

                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${paid
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {paid ? "Paid" : "Pending Payment"}
                            </span>
                        </div>
                    </div>

                    {/* personal */}
                    <Card title="Personal Information">
                        <Info label="Full Name" value={personal.full_name} />
                        <Info label="Email" value={personal.email} />
                        <Info label="Phone" value={personal.phone_number} />
                        <Info label="Country" value={personal.country} />
                        <Info label="Institution" value={personal.institution} />
                        <Info
                            label="Attendance Type"
                            value={personal.attendance_type}
                        />
                    </Card>

                    {/* paper */}
                    <Card title="Paper Information">
                        <Info label="Paper Title" value={paper.paper_title} />
                        <Info label="Track" value={paper.track_name || paper.track} />
                        <Info
                            label="Paper IDs"
                            value={
                                Array.isArray(paper.paper_ids)
                                    ? paper.paper_ids.join(", ")
                                    : "-"
                            }
                        />
                    </Card>

                    {/* billing */}
                    <Card title="Billing Contact">
                        <Info label="Name" value={billing.name} />
                        <Info label="Email" value={billing.email} />
                        <Info label="Phone" value={billing.number} />
                    </Card>

                    {/* payment history */}
                    <Card title="Payment History">
                        {!payments.length ? (
                            <p className="text-slate-500">No payment history yet</p>
                        ) : (
                            <div className="space-y-4">
                                {payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="border rounded-xl p-4 flex justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {payment.transaction_id}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {payment.gateway}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold">
                                                {payment.amount} {payment.currency || ""}
                                            </p>

                                            <span className="text-sm text-blue-600 capitalize">
                                                {payment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* right */}
                <div>
                    <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
                        <h3 className="text-xl font-bold mb-5">
                            Registration Summary
                        </h3>

                        <Row
                            label="Author Count"
                            value={registration.author_count}
                        />

                        <Row
                            label="Payment Status"
                            value={registration.payment_status || "pending"}
                        />

                        <Row
                            label="Transaction ID"
                            value={registration.transaction_id || "-"}
                        />

                        <div className="border-t my-4" />

                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>
                                {registration.total_amount || 0}{" "}
                                {registration.currency || ""}
                            </span>
                        </div>

                        {!paid && (
                            <button
                                onClick={handlePayment}
                                disabled={paying}
                                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold"
                            >
                                {paying ? "Processing..." : "Pay Now"}
                            </button>
                        )}

                        {paid && (
                            <div className="mt-6 bg-green-50 text-green-700 rounded-xl p-4 text-center font-medium">
                                Payment Completed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConferenceRegistrationDashboard;

/* reusable */

function Card({ title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold mb-5">{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="flex justify-between gap-4 border-b pb-2">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-right">
                {value || "-"}
            </span>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between py-2">
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}