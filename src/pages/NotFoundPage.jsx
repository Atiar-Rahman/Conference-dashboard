import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

const NotFoundPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-mesh px-4">
            <div className="w-full max-w-xl rounded-[32px] border border-white/80 bg-white/90 p-10 text-center shadow-panel">
                {/* icon */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                    <SearchX size={42} className="text-slate-700" />
                </div>

                {/* text */}
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    404 Error
                </p>

                <h1 className="mt-3 text-4xl font-bold text-slate-950">
                    Page Not Found
                </h1>

                <p className="mt-4 text-slate-500 leading-7">
                    Sorry, the page you are looking for does not exist
                    or may have been moved.
                </p>

                {/* buttons */}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>

                    <Link
                        to="/login"
                        className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;