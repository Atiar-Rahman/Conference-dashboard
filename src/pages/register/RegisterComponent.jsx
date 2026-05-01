import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import {
    getConferenceTracks,
    getConferenceFeeSummary,
    createConferenceRegistration,
} from "../../lib/api";

const blankAuthor = {
    full_name: "",
    passport_national_id: "",
    country: "",
    attendance_type: "in_person",
    email: "",
    phone_number: "",
    institution: "",
    t_shirt_size: "m",
    will_present: false,
    transportation: "not_needed",
    is_student: false,
};

const categoryOptions = [
    { value: "international_student", label: "International Student" },
    { value: "international_delegate", label: "International Delegate" },
    { value: "local_student", label: "Local Student" },
    { value: "local_delegate", label: "Local Delegate" },
];

const attendanceOptions = [
    { value: "in_person", label: "In Person" },
    { value: "virtual", label: "Virtual" },
];

const tshirtOptions = [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
    { value: "xxl", label: "XXL" },
];

export default function RegisterComponent() {
    const navigate = useNavigate();
    const { conferencePk } = useParams();

    const [tracks, setTracks] = useState([]);
    const [loadingTracks, setLoadingTracks] = useState(true);
    const [feeLoading, setFeeLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [feeSummary, setFeeSummary] = useState(null);
    const [submitError, setSubmitError] = useState("");

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
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
            personal_infos: [blankAuthor],
            billing_contact: {
                name: "",
                email: "",
                number: "",
            },
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "personal_infos",
    });

    const authorCount = Number(watch("author_count") || 1);
    const category = watch("category");
    const authors = watch("personal_infos") || [];

    const firstAuthorAttendance = authors?.[0]?.attendance_type || "";

    useEffect(() => {
        const loadTracks = async () => {
            try {
                setLoadingTracks(true);
                const res = await getConferenceTracks(conferencePk);
                setTracks(res?.tracks || res || []);
            } catch (err) {
                console.error(err);
                setTracks([]);
            } finally {
                setLoadingTracks(false);
            }
        };

        if (conferencePk) loadTracks();
    }, [conferencePk]);

    useEffect(() => {
        const safeCount = Math.max(1, Math.min(5, authorCount));
        const current = fields.length;

        if (safeCount > current) {
            for (let i = current; i < safeCount; i++) {
                append({ ...blankAuthor });
            }
        }

        if (safeCount < current) {
            for (let i = current; i > safeCount; i--) {
                remove(i - 1);
            }
        }
    }, [authorCount, fields.length, append, remove]);

    const feePayload = useMemo(
        () => ({
            conference_id: conferencePk,
            category,
            author_count: authorCount,
        }),
        [conferencePk, category, authorCount]
    );

    useEffect(() => {
        if (!category || !authorCount) {
            setFeeSummary(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setFeeLoading(true);

                const res = await getConferenceFeeSummary(
                    conferencePk,
                    feePayload
                );

                setFeeSummary(res);
            } catch (err) {
                console.error(err);
                setFeeSummary(null);
            } finally {
                setFeeLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [conferencePk, feePayload]);

    const onPresenterChange = (selectedIndex) => {
        authors.forEach((_, i) => {
            setValue(
                `personal_infos.${i}.will_present`,
                i === selectedIndex
            );
        });
    };

    const onSubmit = async (data) => {
        try {
            setSubmitLoading(true);
            setSubmitError("");

            const normalizedAuthors = data.personal_infos.map(
                (author, index) => ({
                    order: index + 1,
                    salutation: author.salutation || "mr",
                    full_name: author.full_name,
                    passport_national_id:
                        author.passport_national_id || "",
                    country: author.country || "",
                    attendance_type:
                        author.attendance_type || "in_person",
                    email: author.email,
                    phone_number: author.phone_number,
                    institution: author.institution || "",
                    t_shirt_size:
                        author.t_shirt_size || "m",
                    will_present: Boolean(author.will_present),
                    transportation:
                        author.transportation || "not_needed",
                    is_student: Boolean(author.is_student),
                })
            );

            const presenter =
                normalizedAuthors.find((author) => author.will_present) ||
                normalizedAuthors[0] ||
                blankAuthor;

            const billingContact = {
                name: data.billing_contact?.name || presenter.full_name || "",
                email: data.billing_contact?.email || presenter.email || "",
                number:
                    data.billing_contact?.number ||
                    presenter.phone_number ||
                    "",
            };

            const normalizedPaperIds = data.paper_info.paper_ids
                ? data.paper_info.paper_ids
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                : [];

            const payload = {
                conference_id: conferencePk,
                author_count: Number(data.author_count),
                category: data.category,
                registration_type:
                    Number(data.author_count) > 0
                        ? "author_participant"
                        : "participant",
                salutation: presenter.salutation || "mr",
                full_name: presenter.full_name || billingContact.name,
                passport_national_id:
                    presenter.passport_national_id || "",
                country: presenter.country || "",
                attendance_type:
                    presenter.attendance_type || "in_person",
                mobile_number:
                    presenter.phone_number || billingContact.number,
                email: billingContact.email || presenter.email || "",
                institution: presenter.institution || "",
                t_shirt_size: presenter.t_shirt_size || "m",
                transportation:
                    presenter.transportation || "not_needed",
                paper_id: normalizedPaperIds[0] || "",
                no_perticipant: Number(data.author_count),

                paper_info: {
                    paper_title: data.paper_info.paper_title,
                    track: data.paper_info.track,
                    paper_ids: normalizedPaperIds,
                },

                personal_infos: normalizedAuthors,
                billing_contact: billingContact,
            };

            console.log(
                "SUBMIT PAYLOAD =",
                JSON.stringify(payload, null, 2)
            );

            const res = await createConferenceRegistration(
                conferencePk,
                payload
            );

            const registrationId =
                res?.id ||
                res?.registration_id ||
                res?.data?.id ||
                res?.data?.registration_id;

            if (!registrationId) {
                throw new Error(
                    "Registration completed, but no registration ID was returned."
                );
            }

            navigate(
                `/conference/${conferencePk}/registration/${registrationId}`
            );
        } catch (err) {
            console.error(err);
            const message =
                err?.detail ||
                err?.message ||
                (typeof err === "string" ? err : "") ||
                "Registration failed. Please try again.";
            setSubmitError(message);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingTracks) {
        return (
            <div className="py-20 text-center text-lg font-semibold">
                Loading...
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
                    {submitError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {submitError}
                        </div>
                    ) : null}

                    <section className="grid md:grid-cols-2 gap-5">
                        <Input
                            label="Author Count"
                            type="number"
                            min={1}
                            max={5}
                            name="author_count"
                            register={register}
                            required
                        />

                        <Select
                            label="Category"
                            name="category"
                            register={register}
                            required
                            options={categoryOptions}
                        />
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold mb-5 border-b pb-2">
                            Author Information
                        </h3>

                        {fields.map((field, index) => (
                            <div key={field.id} className="mb-8 border rounded-2xl p-6">
                                <h4 className="font-bold mb-5">Author {index + 1}</h4>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <Input label="Full Name" name={`personal_infos.${index}.full_name`} register={register} required />
                                    <Input label="Email" name={`personal_infos.${index}.email`} register={register} required />
                                    <Input label="Phone" name={`personal_infos.${index}.phone_number`} register={register} required />
                                    <Input label="Institution" name={`personal_infos.${index}.institution`} register={register} />
                                    <Input label="Country" name={`personal_infos.${index}.country`} register={register} />
                                    <Input label="Passport / National ID" name={`personal_infos.${index}.passport_national_id`} register={register} />

                                    <Select
                                        label="Attendance Type"
                                        name={`personal_infos.${index}.attendance_type`}
                                        register={register}
                                        required
                                        options={attendanceOptions}
                                    />

                                    <Select
                                        label="T Shirt Size"
                                        name={`personal_infos.${index}.t_shirt_size`}
                                        register={register}
                                        options={tshirtOptions}
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 mt-5">
                                    <Checkbox label="Student" name={`personal_infos.${index}.is_student`} register={register} />
                                    <Select
                                        label="Transportation"
                                        name={`personal_infos.${index}.transportation`}
                                        register={register}
                                        options={[
                                            {
                                                value: "not_needed",
                                                label: "Not Needed",
                                            },
                                            {
                                                value: "needed",
                                                label: "Needed",
                                            },
                                        ]}
                                    />

                                    <label className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                                        <input
                                            type="radio"
                                            name="presenter"
                                            checked={authors?.[index]?.will_present || false}
                                            onChange={() => onPresenterChange(index)}
                                        />
                                        <span>Presenter</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold mb-5 border-b pb-2">
                            Paper Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-5">
                            <Input label="Paper Title" name="paper_info.paper_title" register={register} required />
                            <Input label="Paper ID" name="paper_info.paper_ids" register={register} />

                            <Select
                                label="Track"
                                name="paper_info.track"
                                register={register}
                                required
                                options={tracks.map((t) => ({
                                    value: t.id,
                                    label: t.name,
                                }))}
                            />
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold mb-5 border-b pb-2">
                            Billing Contact
                        </h3>

                        <div className="grid md:grid-cols-3 gap-5">
                            <Input label="Name" name="billing_contact.name" register={register} required />
                            <Input label="Email" name="billing_contact.email" register={register} required />
                            <Input label="Phone" name="billing_contact.number" register={register} required />
                        </div>
                    </section>

                    <section className="bg-slate-50 rounded-2xl p-6">
                        <h3 className="font-semibold text-lg mb-4">Fee Summary</h3>

                        {feeLoading ? (
                            <p>Calculating...</p>
                        ) : feeSummary ? (
                            <div className="space-y-3">
                                <Row label="Category" value={feeSummary.category?.replaceAll("_", " ")} />
                                <Row label="Per Author Fee" value={`${feeSummary.amount} ${feeSummary.currency}`} />
                                <Row label="Author Count" value={feeSummary.author_count} />
                                <Row
                                    label="Total"
                                    value={`${feeSummary.total_amount} ${feeSummary.currency}`}
                                    strong
                                />
                            </div>
                        ) : (
                            <p>Select category</p>
                        )}
                    </section>

                    <button
                        disabled={submitLoading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold"
                    >
                        {submitLoading ? "Submitting..." : "Complete Registration"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Row({ label, value, strong }) {
    return (
        <div className={`flex justify-between ${strong ? "text-xl font-bold text-blue-600" : "border-b pb-2"}`}>
            <span>{label}</span>
            <span className="capitalize">{value}</span>
        </div>
    );
}

function Input({ label, name, register, required = false, type = "text", ...rest }) {
    return (
        <div>
            <label className="block font-medium mb-2">{label}</label>
            <input
                type={type}
                {...register(name, required ? { required: `${label} is required` } : {})}
                className="w-full border rounded-xl px-4 py-3"
                {...rest}
            />
        </div>
    );
}

function Select({ label, name, register, options = [], required = false }) {
    return (
        <div>
            <label className="block font-medium mb-2">{label}</label>
            <select
                {...register(name, required ? { required: `${label} is required` } : {})}
                defaultValue=""
                className="w-full border rounded-xl px-4 py-3"
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
