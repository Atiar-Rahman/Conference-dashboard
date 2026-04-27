import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, LockKeyhole, Mail } from "lucide-react";

import {
    getApiDisplayUrl,
    getCurrentUser,
    loginUser,
} from "../../lib/api";

import { AUTH_STORAGE_KEY } from "../../lib/authStorage";

const SignIn = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const data = await loginUser(form);

            if (!data?.access) {
                throw new Error("Access token was not returned by the API.");
            }

            let user = null;

            try {
                user = await getCurrentUser(data.access);
            } catch {
                user = null;
            }

            const session = {
                access: data.access,
                refresh: data.refresh || null,
                email: form.email,
                user,
            };

            localStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify(session)
            );

            window.dispatchEvent(
                new Event("conference_admin_auth_updated")
            );

            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message || "Unable to sign in right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-mesh px-4 py-10">
            <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/80 bg-white/85 shadow-panel lg:grid-cols-[1.05fr_0.95fr]">
                {/* LEFT */}
                <section className="flex flex-col justify-between bg-ink p-8 text-white md:p-12">
                    <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-slate-300">
                            DUET Conference
                        </p>

                        <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight">
                            Admin control for submissions, reviewers, schedule,
                            notifications, and payment tracking.
                        </h1>

                        <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
                            Sign in with your admin account to manage the
                            conference website workflow from one dashboard.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        {[
                            ["Submissions", "Monitor paper intake and decisions"],
                            ["Review", "Coordinate reviewers and feedback"],
                            ["Publish", "Schedule sessions and notify authors"],
                        ].map(([title, text]) => (
                            <div
                                key={title}
                                className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                            >
                                <p className="font-semibold">{title}</p>
                                <p className="mt-2 text-sm text-slate-300">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* RIGHT */}
                <section className="flex items-center p-6 md:p-10">
                    <div className="mx-auto w-full max-w-md">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                            Admin login
                        </p>

                        <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                            Welcome back
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Use your email and password to enter the
                            conference admin dashboard.
                        </p>

                        <form
                            className="mt-8 space-y-4"
                            onSubmit={handleSubmit}
                        >
                            {/* Email */}
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">
                                    Email
                                </span>

                                <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                    <Mail
                                        size={18}
                                        className="text-slate-400"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="admin@email.com"
                                        required
                                        className="w-full border-none bg-transparent p-0 text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </span>
                            </label>

                            {/* Password */}
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">
                                    Password
                                </span>

                                <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                    <LockKeyhole
                                        size={18}
                                        className="text-slate-400"
                                    />

                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full border-none bg-transparent p-0 text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </span>
                            </label>

                            {/* Error */}
                            {error ? (
                                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <AlertCircle
                                        size={18}
                                        className="mt-0.5 shrink-0"
                                    />
                                    <span>{error}</span>
                                </div>
                            ) : null}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting
                                    ? "Signing in..."
                                    : "Sign in to dashboard"}

                                <ArrowRight size={18} />
                            </button>
                        </form>
                        <p className="mt-6 text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-semibold text-cyan hover:text-cyan/80 transition"
                            >
                                Sign in
                            </Link>
                        </p>
                        <p className="mt-6 text-xs leading-5 text-slate-400">
                            API endpoint:{" "}
                            <span className="font-medium text-slate-500">
                                {getApiDisplayUrl("/auth/jwt/create/")}
                            </span>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SignIn;