import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { readStoredAuth } from "../../lib/authStorage";
import {
    getConferenceTracks,
    getConferenceFeeSummary,
    createConferenceRegistration,
} from "../../lib/api";

const RegisterComponent = () => {
    const navigate = useNavigate();
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [tracks, setTracks] = useState([]);
    const [loadingTracks, setLoadingTracks] = useState(true);
    const [feeLoading, setFeeLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [feeSummary, setFeeSummary] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            conference_id: conferencePk,
            author_count: 1,
            category: "",

            paper_info: {
                paper_title: "",
                track: "",
                paper_ids: "",
            },

            personal_infos: {
                full_name: "",
                passport_national_id: "",
                country: "",
                attendance_type: "",
                email: "",
                phone_number: "",
                institution: "",
                t_shirt_size: "",
                will_present: false,
                transportation: false,
                is_student: false,
            },

            billing_contact: {
                name: "",
                email: "",
                number: "",
            },
        },
    });

    const watched = watch();

    useEffect(() => {
        const loadTracks = async () => {
            try {
                setLoadingTracks(true);
                const res = await getConferenceTracks(conferencePk, token);
                setTracks(res?.tracks || res || []);
            } catch (err) {
                console.error(err);
                setTracks([]);
            } finally {
                setLoadingTracks(false);
            }
        };

        if (conferencePk && token) loadTracks();
    }, [conferencePk, token]);

    // fee payload
    const feePayload = useMemo(() => {
        return {
            conference: conferencePk,
            category: watched.category,
            author_count: Number(watched.author_count || 1),

            personal_infos: {
                attendance_type: watched.personal_infos?.attendance_type,
                is_student: watched.personal_infos?.is_student || false,
            },
        };
    }, [
        conferencePk,
        watched.category,
        watched.author_count,
        watched.personal_infos?.attendance_type,
        watched.personal_infos?.is_student,
    ]);

    // fee summary
    useEffect(() => {
        if (!watched.category) return;
        if (!watched.personal_infos?.attendance_type) return;

        const timeout = setTimeout(async () => {
            try {
                setFeeLoading(true);

                const res = await getConferenceFeeSummary(
                    conferencePk,
                    feePayload,
                    token
                );

                setFeeSummary(res);
            } catch (err) {
                console.error(err);
                setFeeSummary(null);
            } finally {
                setFeeLoading(false);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [
        conferencePk,
        token,
        feePayload,
        watched.category,
        watched.personal_infos?.attendance_type,
    ]);

    const onSubmit = async (data) => {
        try {
            setSubmitLoading(true);

            const payload = {
                ...data,
                conference_id: conferencePk,
                author_count: Number(data.author_count),
            };

            const res = await createConferenceRegistration(
                conferencePk,
                payload,
                token
            );

            navigate(`/conference/${conferencePk}/registration/${res.id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingTracks) {
        return (
            <div className="py-20 text-center text-lg font-medium">
                Loading tracks...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-8">
                    Conference Registration
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                    {/* Personal */}
                    <section>
                        <h3 className="text-xl font-semibold mb-5 border-b pb-2">
                            Personal Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-5">
                            <Input
                                label="Full Name"
                                name="personal_infos.full_name"
                                register={register}
                                required
                                error={errors?.personal_infos?.full_name}
                            />

                            <Input
                                label="Email"
                                type="email"
                                name="personal_infos.email"
                                register={register}
                                required
                                error={errors?.personal_infos?.email}
                            />

                            <Input
                                label="Phone"
                                name="personal_infos.phone_number"
                                register={register}
                            />

                            <Input
                                label="Institution"
                                name="personal_infos.institution"
                                register={register}
                            />

                            <Input
                                label="Country"
                                name="personal_infos.country"
                                register={register}
                            />

                            <Input
                                label="Passport / National ID"
                                name="personal_infos.passport_national_id"
                                register={register}
                            />

                            <Select
                                label="Attendance Type"
                                name="personal_infos.attendance_type"
                                register={register}
                                required
                                options={[
                                    {
                                        value: "author_participant",
                                        label: "Author Participant",
                                    },
                                    {
                                        value: "delegate",
                                        label: "Delegate",
                                    },
                                ]}
                            />

                            <Select
                                label="Category"
                                name="category"
                                register={register}
                                required
                                options={[
                                    {
                                        value: "international_student",
                                        label: "International Student",
                                    },
                                    {
                                        value: "international_delegate",
                                        label: "International Delegate",
                                    },
                                    {
                                        value: "local_student",
                                        label: "Local Student",
                                    },
                                    {
                                        value: "local_delegate",
                                        label: "Local Delegate",
                                    },
                                ]}
                            />

                            <Select
                                label="T Shirt Size"
                                name="personal_infos.t_shirt_size"
                                register={register}
                                options={[
                                    { value: "S", label: "S" },
                                    { value: "M", label: "M" },
                                    { value: "L", label: "L" },
                                    { value: "XL", label: "XL" },
                                ]}
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mt-5">
                            <Checkbox
                                label="Student"
                                name="personal_infos.is_student"
                                register={register}
                            />

                            <Checkbox
                                label="Will Present"
                                name="personal_infos.will_present"
                                register={register}
                            />

                            <Checkbox
                                label="Transportation Needed"
                                name="personal_infos.transportation"
                                register={register}
                            />
                        </div>
                    </section>

                    {/* Paper */}
                    <section>
                        <h3 className="text-xl font-semibold mb-5 border-b pb-2">
                            Paper Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-5">
                            <Input
                                label="Paper Title"
                                name="paper_info.paper_title"
                                register={register}
                            />

                            <Input
                                label="Paper ID"
                                name="paper_info.paper_ids"
                                register={register}
                            />

                            <Select
                                label="Track"
                                name="paper_info.track"
                                register={register}
                                required
                                options={tracks.map((track) => ({
                                    value: track.id,
                                    label: track.name,
                                }))}
                            />
                        </div>
                    </section>

                    {/* Billing */}
                    <section>
                        <h3 className="text-xl font-semibold mb-5 border-b pb-2">
                            Billing Contact
                        </h3>

                        <div className="grid md:grid-cols-3 gap-5">
                            <Input label="Name" name="billing_contact.name" register={register} />
                            <Input label="Email" name="billing_contact.email" register={register} />
                            <Input label="Phone" name="billing_contact.number" register={register} />
                        </div>
                    </section>

                    <Input
                        type="number"
                        min={1}
                        label="Author Count"
                        name="author_count"
                        register={register}
                    />

                    {/* Fee */}
                    <section className="bg-slate-50 rounded-2xl p-6">
                        <h3 className="font-semibold text-lg mb-4">
                            Fee Summary
                        </h3>

                        {feeLoading ? (
                            <p>Calculating...</p>
                        ) : feeSummary ? (
                            <div className="space-y-2">
                                <p>Category: {feeSummary.category}</p>
                                <p>Amount: {feeSummary.amount}</p>
                                <p>Currency: {feeSummary.currency}</p>

                                <p className="font-bold text-xl text-blue-600">
                                    Total: {feeSummary.total}
                                </p>
                            </div>
                        ) : (
                            <p>Select category + attendance type.</p>
                        )}
                    </section>

                    <button
                        disabled={submitLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
                    >
                        {submitLoading ? "Submitting..." : "Complete Registration"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterComponent;

function Input({
    label,
    name,
    register,
    required = false,
    type = "text",
    error,
    ...rest
}) {
    return (
        <div>
            <label className="block font-medium mb-2">{label}</label>

            <input
                type={type}
                {...register(name, required ? { required: `${label} is required` } : {})}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                {...rest}
            />

            {error && (
                <p className="text-red-500 text-sm mt-1">
                    {error.message}
                </p>
            )}
        </div>
    );
}

function Select({
    label,
    name,
    register,
    options = [],
    required = false,
}) {
    return (
        <div>
            <label className="block font-medium mb-2">{label}</label>

            <select
                {...register(name, required ? { required: `${label} is required` } : {})}
                className="w-full border rounded-xl px-4 py-3"
                defaultValue=""
            >
                <option value="">Select</option>

                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function Checkbox({ label, name, register }) {
    return (
        <label className="flex items-center gap-3 bg-slate-100 px-4 py-3 rounded-xl">
            <input type="checkbox" {...register(name)} />
            <span>{label}</span>
        </label>
    );
}