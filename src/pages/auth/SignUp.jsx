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
import { useForm } from "react-hook-form";

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setError,
    } = useForm();

    const password = watch("password");

    const onSubmit = async (data) => {
        try {
            // confirm_password remove
            const payload = {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: data.password,
            };

            console.log("API payload:", payload);

            // await registerUser(payload);
        } catch (err) {
            setError("root", {
                message: err.message || "Unable to create account.",
            });
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
                            Setup your admin profile for submissions, reviewers,
                            schedules, notifications, and payments.
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

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="mt-8 space-y-4"
                        >
                            {/* First + Last */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">
                                        First name
                                    </span>

                                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                        <User size={18} className="text-slate-400" />
                                        <input
                                            {...register("first_name", {
                                                required: "First name is required",
                                            })}
                                            placeholder="John"
                                            className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                        />
                                    </div>

                                    {errors.first_name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.first_name.message}
                                        </p>
                                    )}
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">
                                        Last name
                                    </span>

                                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                        <User size={18} className="text-slate-400" />
                                        <input
                                            {...register("last_name", {
                                                required: "Last name is required",
                                            })}
                                            placeholder="Doe"
                                            className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                        />
                                    </div>

                                    {errors.last_name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.last_name.message}
                                        </p>
                                    )}
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
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        placeholder="admin@email.com"
                                        className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                    />
                                </div>

                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}
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
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 8,
                                                message:
                                                    "Password must be at least 8 characters",
                                            },
                                        })}
                                        placeholder="Enter password"
                                        className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="text-slate-400 hover:text-slate-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}
                            </label>

                            {/* Confirm */}
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">
                                    Confirm password
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                    <LockKeyhole size={18} className="text-slate-400" />

                                    <input
                                        type={
                                            showConfirmPassword ? "text" : "password"
                                        }
                                        {...register("confirm_password", {
                                            required: "Confirm password is required",
                                            validate: (value) =>
                                                value === password ||
                                                "Passwords do not match",
                                        })}
                                        placeholder="Confirm password"
                                        className="w-full border-none bg-transparent p-0 text-slate-900 outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="text-slate-400 hover:text-slate-700"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                {errors.confirm_password && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.confirm_password.message}
                                    </p>
                                )}
                            </label>

                            {errors.root && (
                                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <AlertCircle size={18} />
                                    <span>{errors.root.message}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-70"
                            >
                                {isSubmitting
                                    ? "Creating account..."
                                    : "Create account"}
                                <ArrowRight size={18} />
                            </button>
                        </form>

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