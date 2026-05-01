import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getConferenceRegistration,
    payConferenceRegistration,
} from "../../lib/api";

const ConferenceRegistrationDashboard = () => {
    const { conferencePk, registrationId } = useParams();

    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [registration, setRegistration] = useState(null);

    const loadRegistration = async () => {
        try {
            setLoading(true);

            const res = await getConferenceRegistration(
                conferencePk,
                registrationId
            );

            console.log("registration =", res);
            setRegistration(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!conferencePk || !registrationId) return;
        loadRegistration();
    }, [conferencePk, registrationId]);

    const handlePayment = async () => {
        try {
            setPaying(true);

            const res = await payConferenceRegistration(
                conferencePk,
                registrationId
            );

            if (res?.gateway_url) {
                window.location.href = res.gateway_url;
                return;
            }

            await loadRegistration();
        } catch (error) {
            console.error(error);
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-20 text-center text-lg font-medium">
                Loading registration...
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="max-w-7xl mx-auto py-20 text-center text-red-500">
                Registration not found
            </div>
        );
    }

    const authors = registration.personal_infos || [];
    const paper = registration.paper_info || {};
    const billing = registration.billing_contact || {};
    const payments = registration.payments || [];
    const fee = registration.fee_detail || {};

    const paid =
        registration.payment_status === true ||
        registration.status === "paid";

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-6">
                    {/* status */}
                    <Card>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Registration ID
                                </p>

                                <h2 className="text-2xl font-bold mt-1">
                                    #{registration.id}
                                </h2>
                            </div>

                            <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${paid
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {paid ? "Paid" : "Pending Payment"}
                            </span>
                        </div>
                    </Card>

                    {/* authors */}
                    <Card title={`Authors (${authors.length})`}>
                        <div className="space-y-6">
                            {authors.map((author, index) => (
                                <div
                                    key={index}
                                    className="border rounded-2xl p-5 bg-slate-50"
                                >
                                    <h4 className="font-bold text-lg mb-4">
                                        Author {index + 1}
                                    </h4>

                                    <div className="grid md:grid-cols-2 gap-3">
                                        <Info
                                            label="Full Name"
                                            value={author.full_name}
                                        />
                                        <Info
                                            label="Email"
                                            value={author.email}
                                        />
                                        <Info
                                            label="Phone"
                                            value={author.phone_number}
                                        />
                                        <Info
                                            label="Country"
                                            value={author.country}
                                        />
                                        <Info
                                            label="Institution"
                                            value={author.institution}
                                        />
                                        <Info
                                            label="Attendance"
                                            value={author.attendance_type}
                                        />
                                        <Info
                                            label="Student"
                                            value={
                                                author.is_student
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />
                                        <Info
                                            label="Presenter"
                                            value={
                                                author.will_present
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* paper */}
                    <Card title="Paper Information">
                        <Info
                            label="Paper Title"
                            value={paper.paper_title}
                        />

                        <Info
                            label="Track"
                            value={paper.track_name || paper.track}
                        />

                        <Info
                            label="Paper IDs"
                            value={
                                Array.isArray(paper.paper_ids)
                                    ? paper.paper_ids.join(", ")
                                    : paper.paper_ids || "-"
                            }
                        />
                    </Card>

                    {/* billing */}
                    <Card title="Billing Contact">
                        <Info label="Name" value={billing.name} />
                        <Info label="Email" value={billing.email} />
                        <Info label="Phone" value={billing.number} />
                    </Card>

                    {/* payments */}
                    <Card title="Payment History">
                        {!payments.length ? (
                            <p className="text-slate-500">
                                No payment history
                            </p>
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
                                                {payment.amount}{" "}
                                                {payment.currency}
                                            </p>

                                            <p className="text-sm capitalize text-blue-600">
                                                {payment.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* RIGHT */}
                <div>
                    <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
                        <h3 className="text-xl font-bold mb-5">
                            Registration Summary
                        </h3>

                        <Row
                            label="Fee Title"
                            value={fee.title}
                        />

                        <Row
                            label="Category"
                            value={fee.category?.replaceAll("_", " ")}
                        />

                        <Row
                            label="Per Author"
                            value={`${fee.amount || 0} ${fee.currency || ""
                                }`}
                        />

                        <Row
                            label="Author Count"
                            value={registration.author_count}
                        />

                        <Row
                            label="Status"
                            value={registration.status}
                        />

                        <Row
                            label="Transaction"
                            value={registration.transaction_id || "-"}
                        />

                        <div className="border-t my-4" />

                        <div className="flex justify-between text-xl font-bold text-blue-600">
                            <span>Total</span>

                            <span>
                                {registration.total_amount}{" "}
                                {fee.currency || ""}
                            </span>
                        </div>

                        {!paid ? (
                            <button
                                onClick={handlePayment}
                                disabled={paying}
                                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
                            >
                                {paying ? "Processing..." : "Pay Now"}
                            </button>
                        ) : (
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
            {title && (
                <h3 className="text-xl font-bold mb-5">
                    {title}
                </h3>
            )}

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
        <div className="flex justify-between py-2 border-b">
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold capitalize">
                {value || "-"}
            </span>
        </div>
    );
}