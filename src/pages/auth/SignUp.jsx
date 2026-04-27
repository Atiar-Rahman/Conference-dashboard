import { useState } from "react";
import {
    AlertCircle,
    ArrowRight,
    LockKeyhole,
    Mail,
    User,
    Eye,
    EyeOff,
} from "lucide-react";
import { Link } from "react-router-dom";

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // validation
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (form.password !== form.confirm_password) {
            setError("Password and confirm password do not match.");
            return;
        }

        try {
            setIsSubmitting(true);

            // request body (confirm_password যাবে না)
            const payload = {
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
            };

            console.log("API payload:", payload);

            // example:
            // await registerUser(payload);

        } catch (err) {
            setError(err.message || "Unable to create account.");
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
                            Create your conference admin account and start managing everything
                            from one dashboard.
                        </h1>

                        <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
                            Setup your admin profile for submissions, reviewers, schedules,
                            notifications, and payments.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        {[
                            ["Manage", "Create and manage conference workflows"],
                            ["Review", "Coordinate reviewers and decisions"],
                            ["Publish", "Schedule sessions and notify authors"],
                        ].map(([title, text]) => (
                            <div
                                key={title}
                                className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                            >
                                <p className="font-semibold">{title}</p>
                                <p className="mt-2 text-sm text-slate-300">{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* RIGHT */}
                <section className="flex items-center p-6 md:p-10">
                    <div className="mx-auto w-full max-w-md">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                            Admin Registration
                        </p>

                        <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                            Create account
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Register your admin account to continue.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                            {/* First + Last Name */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">
                                        First name
                                    </span>

                                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                        <User size={18} className="text-slate-400" />

                                        <input
                                            type="text"
                                            name="first_name"
                                            value={form.first_name}
                                            onChange={handleChange}
                                            placeholder="John"
                                            required
                                            className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                        />
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">
                                        Last name
                                    </span>

                                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                        <User size={18} className="text-slate-400" />

                                        <input
                                            type="text"
                                            name="last_name"
                                            value={form.last_name}
                                            onChange={handleChange}
                                            placeholder="Doe"
                                            required
                                            className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Email */}
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">
                                    Email
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                    <Mail size={18} className="text-slate-400" />

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="admin@email.com"
                                        required
                                        className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                    />
                                </div>
                            </label>

                            {/* Password */}
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">
                                    Password
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                    <LockKeyhole size={18} className="text-slate-400" />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        required
                                        className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 hover:text-slate-700 transition"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </label>

                            {/* Confirm Password */}
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">
                                    Confirm password
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                    <LockKeyhole size={18} className="text-slate-400" />

                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirm_password"
                                        value={form.confirm_password}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        required
                                        className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        className="text-slate-400 hover:text-slate-700 transition"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </label>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-70"
                            >
                                {isSubmitting ? "Creating account..." : "Create account"}
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="mt-6 text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-cyan hover:text-cyan/80 transition"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SignUp;