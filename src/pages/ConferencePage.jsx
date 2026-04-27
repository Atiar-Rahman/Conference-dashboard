import { CalendarDays, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SectionCard from "../components/SectionCard";
import StatusBadge from "../components/StatusBadge";
import { schedule, tracks } from "../data/dashboard";
import { conferenceSections } from "../data/conferenceSections";
import {
  createAboutEvent,
  createConference,
  deleteAboutEvent,
  deleteConference,
  getAdminAboutEventListUrl,
  getAboutEvents,
  getAdminAboutEventChangeUrl,
  getAdminAboutEventDeleteUrl,
  getConference,
  getConferences,
  updateAboutEvent,
  updateConference,
} from "../lib/api";

const createConferenceInitialForm = {
  name: "",
  short_name: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
  is_published: false,
};

const aboutEventInitialForm = {
  hero_badge: "",
  hero_title: "",
  hero_summary: "",
  submission_process_title: "",
  full_paper_title: "",
  proceedings_title: "",
  venue_title: "",
  submission_path_title: "",
  where_to_submit_title: "",
  indexing_title: "",
  indexing_disclaimer: "",
  sponsors_title: "",
  sponsors_disclaimer: "",
  timeline_title: "",
  fees_title: "",
  fees_summary: "",
  contact_title: "",
  contact: {
    name: "",
    role: "",
    organization: "",
    phone: "",
    cell: "",
    email: "",
    ctaLabel: "",
  },
};

function coalesce(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return "";
}

function normalizeAboutEventForm(item) {
  const source = item || {};
  const sourceContact = source.contact || source.contact_info || {};

  return {
    ...aboutEventInitialForm,
    hero_badge: coalesce(source.hero_badge, source.heroBadge),
    hero_title: coalesce(source.hero_title, source.heroTitle),
    hero_summary: coalesce(source.hero_summary, source.heroSummary),
    submission_process_title: coalesce(source.submission_process_title, source.submissionProcessTitle),
    full_paper_title: coalesce(source.full_paper_title, source.fullPaperTitle),
    proceedings_title: coalesce(source.proceedings_title, source.proceedingsTitle),
    venue_title: coalesce(source.venue_title, source.venueTitle),
    submission_path_title: coalesce(source.submission_path_title, source.submissionPathTitle),
    where_to_submit_title: coalesce(source.where_to_submit_title, source.whereToSubmitTitle),
    indexing_title: coalesce(source.indexing_title, source.indexingTitle),
    indexing_disclaimer: coalesce(source.indexing_disclaimer, source.indexingDisclaimer),
    sponsors_title: coalesce(source.sponsors_title, source.sponsorsTitle),
    sponsors_disclaimer: coalesce(source.sponsors_disclaimer, source.sponsorsDisclaimer),
    timeline_title: coalesce(source.timeline_title, source.timelineTitle),
    fees_title: coalesce(source.fees_title, source.feesTitle),
    fees_summary: coalesce(source.fees_summary, source.feesSummary),
    contact_title: coalesce(source.contact_title, source.contactTitle),
    contact: {
      ...aboutEventInitialForm.contact,
      name: coalesce(sourceContact.name),
      role: coalesce(sourceContact.role),
      organization: coalesce(sourceContact.organization),
      phone: coalesce(sourceContact.phone),
      cell: coalesce(sourceContact.cell),
      email: coalesce(sourceContact.email),
      ctaLabel: coalesce(sourceContact.ctaLabel, sourceContact.cta_label, sourceContact.cta),
    },
  };
}

function CreateConferenceModal({ form, onChange, onSubmit, onClose, isSubmitting, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Conference</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Create conference</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                placeholder="DUET Research Conference 2026"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Short name</span>
              <input
                type="text"
                name="short_name"
                value={form.short_name}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                placeholder="DUETCONF26"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Location</span>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
              placeholder="Gazipur, Bangladesh"
              required
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Start date</span>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">End date</span>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
              placeholder="Short overview of the conference..."
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Publish now</p>
              <p className="text-xs text-slate-500">Make it visible on the public site immediately.</p>
            </div>
            <input
              type="checkbox"
              name="is_published"
              checked={Boolean(form.is_published)}
              onChange={onChange}
              className="h-5 w-5 accent-slate-950"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus size={16} />
              {isSubmitting ? "Creating..." : "Create conference"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AboutEventModal({ title, mode, form, onChange, onSubmit, onClose, isSubmitting, error }) {
  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/35 px-4 py-6">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-panel">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">About event</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-6">
          <form id="about-event-form" className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Hero</p>
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Hero badge</span>
                    <input
                      type="text"
                      name="hero_badge"
                      value={form.hero_badge}
                      onChange={onChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Hero title</span>
                    <input
                      type="text"
                      name="hero_title"
                      value={form.hero_title}
                      onChange={onChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Hero summary</span>
                    <textarea
                      name="hero_summary"
                      value={form.hero_summary}
                      onChange={onChange}
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Fees</p>
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Fees title</span>
                    <input
                      type="text"
                      name="fees_title"
                      value={form.fees_title}
                      onChange={onChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Fees summary</span>
                    <textarea
                      name="fees_summary"
                      value={form.fees_summary}
                      onChange={onChange}
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Titles</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ["submission_process_title", "Submission process title"],
                    ["full_paper_title", "Full paper title"],
                    ["proceedings_title", "Proceedings title"],
                    ["venue_title", "Venue title"],
                    ["submission_path_title", "Submission path title"],
                    ["where_to_submit_title", "Where to submit title"],
                    ["timeline_title", "Timeline title"],
                    ["contact_title", "Contact title"],
                  ].map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
                      <input
                        type="text"
                        name={key}
                        value={form[key] || ""}
                        onChange={onChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Indexing</p>
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Indexing title</span>
                    <input
                      type="text"
                      name="indexing_title"
                      value={form.indexing_title}
                      onChange={onChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Indexing disclaimer</span>
                    <textarea
                      name="indexing_disclaimer"
                      value={form.indexing_disclaimer}
                      onChange={onChange}
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Sponsors</p>
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Sponsors title</span>
                    <input
                      type="text"
                      name="sponsors_title"
                      value={form.sponsors_title}
                      onChange={onChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Sponsors disclaimer</span>
                    <textarea
                      name="sponsors_disclaimer"
                      value={form.sponsors_disclaimer}
                      onChange={onChange}
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                </div>
              </div>
            </div>
            </div>

            <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Contact</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["name", "Name"],
                ["role", "Role"],
                ["organization", "Organization"],
                ["phone", "Phone"],
                ["cell", "Cell"],
                ["email", "Email"],
                ["ctaLabel", "CTA label"],
              ].map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
                  <input
                    type={key === "email" ? "email" : "text"}
                    name={`contact.${key}`}
                    value={form.contact?.[key] || ""}
                    onChange={onChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                  />
                </label>
              ))}
            </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}
          </form>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-white p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="about-event-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isEdit ? <Pencil size={16} /> : <Plus size={16} />}
            {isSubmitting ? (isEdit ? "Updating..." : "Adding...") : isEdit ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditConferenceModal({ form, onChange, onSubmit, onClose, isSubmitting, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Conference</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Update conference</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Short name</span>
              <input
                type="text"
                name="short_name"
                value={form.short_name}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Location</span>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
              required
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Start date</span>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">End date</span>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Published</p>
              <p className="text-xs text-slate-500">Show it on the public site.</p>
            </div>
            <input
              type="checkbox"
              name="is_published"
              checked={Boolean(form.is_published)}
              onChange={onChange}
              className="h-5 w-5 accent-slate-950"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Pencil size={16} />
              {isSubmitting ? "Updating..." : "Update conference"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewConferenceModal({ conference, token, onClose, onEdit, onDelete }) {
  const [details, setDetails] = useState(conference);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!conference?.id) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const fetched = await getConference(conference.id, token);
        if (!cancelled) {
          setDetails(fetched || conference);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.message || "Unable to load conference details.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [conference, token]);

  const data = details || conference || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Conference</p>
            <h3 className="mt-2 truncate text-2xl font-semibold text-slate-950">{data.name || "Untitled conference"}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {(data.start_date || "No start date") + " → " + (data.end_date || "No end date")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Short name</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{data.short_name || "—"}</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{data.location || "—"}</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{data.is_published ? "Published" : "Draft"}</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">ID</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{data.id ?? "—"}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Description</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{data.description || "—"}</p>
        </div>

        <div className="mt-5 flex items-center justify-end">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onEdit(data)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              disabled={!data?.id}
            >
              <Pencil size={16} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(data)}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
              disabled={!data?.id}
            >
              <Trash2 size={16} />
              Delete
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Close
            </button>
          </div>
        </div>

        {isLoading ? <div className="mt-3 text-xs text-slate-500">Loading details...</div> : null}
      </div>
    </div>
  );
}

export default function ConferencePage({ auth }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedKey = searchParams.get("section") || "important-dates";
  const selectedSection = useMemo(
    () => conferenceSections.find((section) => section.key === selectedKey) || conferenceSections.find((s) => s.key === "important-dates"),
    [selectedKey],
  );
  const token = auth?.access;
  const [conferences, setConferences] = useState([]);
  const [conferencePage, setConferencePage] = useState(1);
  const [conferencePagination, setConferencePagination] = useState({ count: 0, next: null, previous: null });
  const [isLoadingConferences, setIsLoadingConferences] = useState(false);
  const [conferenceError, setConferenceError] = useState("");
  const [activeConferenceId, setActiveConferenceId] = useState(() => searchParams.get("conference") || "");
  const activeConference = useMemo(
    () => conferences.find((item) => String(item.id) === String(activeConferenceId)) || null,
    [conferences, activeConferenceId],
  );
  const [showCreateConference, setShowCreateConference] = useState(false);
  const [viewingConference, setViewingConference] = useState(null);
  const [editingConference, setEditingConference] = useState(null);
  const [editConferenceForm, setEditConferenceForm] = useState(createConferenceInitialForm);
  const [isUpdatingConference, setIsUpdatingConference] = useState(false);
  const [updateConferenceError, setUpdateConferenceError] = useState("");
  const [createConferenceForm, setCreateConferenceForm] = useState(createConferenceInitialForm);
  const [isCreatingConference, setIsCreatingConference] = useState(false);
  const [createConferenceError, setCreateConferenceError] = useState("");
  const [createConferenceSuccess, setCreateConferenceSuccess] = useState("");
  const [updateConferenceSuccess, setUpdateConferenceSuccess] = useState("");

  const [aboutEvents, setAboutEvents] = useState([]);
  const [aboutEventPage, setAboutEventPage] = useState(1);
  const [aboutEventPagination, setAboutEventPagination] = useState({ count: 0, next: null, previous: null });
  const [isLoadingAboutEvents, setIsLoadingAboutEvents] = useState(false);
  const [aboutEventError, setAboutEventError] = useState("");
  const [showCreateAboutEvent, setShowCreateAboutEvent] = useState(false);
  const [editingAboutEvent, setEditingAboutEvent] = useState(null);
  const [aboutEventForm, setAboutEventForm] = useState(aboutEventInitialForm);
  const [isSavingAboutEvent, setIsSavingAboutEvent] = useState(false);
  const [aboutEventSuccess, setAboutEventSuccess] = useState("");

  const setSelectedKey = (key) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("section", key);
      if (activeConferenceId) {
        next.set("conference", activeConferenceId);
      }
      return next;
    });
  };

  const addLabel = selectedSection?.label ? `Add ${selectedSection.label.toLowerCase()}` : "Add";

  const loadConferences = async (targetPage = conferencePage) => {
    setIsLoadingConferences(true);
    setConferenceError("");

    try {
      const data = await getConferences(token, targetPage);
      const nextConferences = Array.isArray(data) ? data : data?.results || [];

      setConferences(nextConferences);
      setConferencePagination({
        count: data?.count || nextConferences.length,
        next: data?.next || null,
        previous: data?.previous || null,
      });
      setConferencePage(targetPage);

      const urlConference = searchParams.get("conference");
      const desiredId = urlConference || activeConferenceId;
      const exists = desiredId && nextConferences.some((item) => String(item.id) === String(desiredId));
      if (exists) {
        setActiveConferenceId(desiredId);
      } else if (nextConferences[0]?.id) {
        setActiveConferenceId(String(nextConferences[0].id));
      }
    } catch (error) {
      setConferenceError(error?.message || "Unable to load conferences.");
    } finally {
      setIsLoadingConferences(false);
    }
  };

  useEffect(() => {
    loadConferences(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadAboutEvents = async (targetPage = aboutEventPage) => {
    if (!activeConferenceId) {
      return;
    }

    setIsLoadingAboutEvents(true);
    setAboutEventError("");

    try {
      const data = await getAboutEvents(activeConferenceId, token, targetPage);
      const nextItems = Array.isArray(data) ? data : data?.results || [];
      setAboutEvents(nextItems);
      setAboutEventPagination({
        count: data?.count || nextItems.length,
        next: data?.next || null,
        previous: data?.previous || null,
      });
      setAboutEventPage(targetPage);
    } catch (error) {
      const fallback = ` Admin list: ${getAdminAboutEventListUrl()}`;
      setAboutEventError((error?.message || "Unable to load about events.") + fallback);
    } finally {
      setIsLoadingAboutEvents(false);
    }
  };

  useEffect(() => {
    if (selectedSection?.key !== "about-events") {
      return;
    }
    loadAboutEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection?.key, activeConferenceId, token]);

  const handleCreateConferenceChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCreateConferenceForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateConferenceSubmit = async (event) => {
    event.preventDefault();
    setCreateConferenceError("");
    setCreateConferenceSuccess("");
    setIsCreatingConference(true);

    try {
      const payload = {
        name: createConferenceForm.name,
        short_name: createConferenceForm.short_name,
        location: createConferenceForm.location,
        start_date: createConferenceForm.start_date,
        end_date: createConferenceForm.end_date,
        description: createConferenceForm.description,
        is_published: Boolean(createConferenceForm.is_published),
      };

      await createConference(payload, token);
      setShowCreateConference(false);
      setCreateConferenceForm(createConferenceInitialForm);
      setCreateConferenceSuccess("Conference created successfully.");
      loadConferences(1);
    } catch (error) {
      setCreateConferenceError(error?.message || "Unable to create conference.");
    } finally {
      setIsCreatingConference(false);
    }
  };

  const handleAboutEventChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith("contact.")) {
      const key = name.replace("contact.", "");
      setAboutEventForm((current) => ({
        ...current,
        contact: {
          ...(current.contact || {}),
          [key]: value,
        },
      }));
      return;
    }

    setAboutEventForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openCreateAboutEvent = () => {
    setAboutEventError("");
    setAboutEventSuccess("");
    setEditingAboutEvent(null);
    setAboutEventForm(aboutEventInitialForm);
    setShowCreateAboutEvent(true);
  };

  const openEditAboutEvent = (item) => {
    setAboutEventError("");
    setAboutEventSuccess("");
    setEditingAboutEvent(item);
    setAboutEventForm(normalizeAboutEventForm(item));
    setShowCreateAboutEvent(true);
  };

  const handleSaveAboutEvent = async (event) => {
    event.preventDefault();
    if (!activeConferenceId) {
      return;
    }

    setIsSavingAboutEvent(true);
    setAboutEventError("");
    setAboutEventSuccess("");

    const payload = {
      hero_badge: aboutEventForm.hero_badge,
      hero_title: aboutEventForm.hero_title,
      hero_summary: aboutEventForm.hero_summary,
      submission_process_title: aboutEventForm.submission_process_title,
      full_paper_title: aboutEventForm.full_paper_title,
      proceedings_title: aboutEventForm.proceedings_title,
      venue_title: aboutEventForm.venue_title,
      submission_path_title: aboutEventForm.submission_path_title,
      where_to_submit_title: aboutEventForm.where_to_submit_title,
      indexing_title: aboutEventForm.indexing_title,
      indexing_disclaimer: aboutEventForm.indexing_disclaimer,
      sponsors_title: aboutEventForm.sponsors_title,
      sponsors_disclaimer: aboutEventForm.sponsors_disclaimer,
      timeline_title: aboutEventForm.timeline_title,
      fees_title: aboutEventForm.fees_title,
      fees_summary: aboutEventForm.fees_summary,
      contact_title: aboutEventForm.contact_title,
      contact: {
        name: aboutEventForm.contact?.name,
        role: aboutEventForm.contact?.role,
        organization: aboutEventForm.contact?.organization,
        phone: aboutEventForm.contact?.phone,
        cell: aboutEventForm.contact?.cell,
        email: aboutEventForm.contact?.email,
        ctaLabel: aboutEventForm.contact?.ctaLabel,
      },
    };

    try {
      if (editingAboutEvent?.id) {
        await updateAboutEvent(activeConferenceId, editingAboutEvent.id, payload, token);
        setAboutEventSuccess("About event updated successfully.");
      } else {
        await createAboutEvent(activeConferenceId, payload, token);
        setAboutEventSuccess("About event created successfully.");
      }

      setShowCreateAboutEvent(false);
      setEditingAboutEvent(null);
      setAboutEventForm(aboutEventInitialForm);
      loadAboutEvents(1);
    } catch (error) {
      const id = editingAboutEvent?.id;
      const fallback =
        id
          ? ` Admin update: ${getAdminAboutEventChangeUrl(id)} Admin delete: ${getAdminAboutEventDeleteUrl(id)}`
          : "";
      setAboutEventError((error?.message || "Unable to save about event.") + fallback);
    } finally {
      setIsSavingAboutEvent(false);
    }
  };

  const handleDeleteAboutEvent = async (item) => {
    if (!activeConferenceId || !item?.id) {
      return;
    }

    const confirmed = window.confirm("Delete this about event?");
    if (!confirmed) {
      return;
    }

    setAboutEventError("");
    setAboutEventSuccess("");

    try {
      await deleteAboutEvent(activeConferenceId, item.id, token);
      setAboutEventSuccess("About event deleted successfully.");
      loadAboutEvents(aboutEventPage);
    } catch (error) {
      const fallback = ` Admin delete: ${getAdminAboutEventDeleteUrl(item.id)}`;
      setAboutEventError((error?.message || "Unable to delete about event.") + fallback);
    }
  };

  const handleEditConferenceChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditConferenceForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openEditConference = (conference) => {
    if (!conference?.id) {
      return;
    }

    setUpdateConferenceError("");
    setUpdateConferenceSuccess("");
    setEditingConference(conference);
    setEditConferenceForm({
      name: conference.name || "",
      short_name: conference.short_name || "",
      location: conference.location || "",
      start_date: conference.start_date || "",
      end_date: conference.end_date || "",
      description: conference.description || "",
      is_published: Boolean(conference.is_published),
    });
    setViewingConference(null);
  };

  const handleEditConferenceSubmit = async (event) => {
    event.preventDefault();
    if (!editingConference?.id) {
      return;
    }

    setUpdateConferenceError("");
    setUpdateConferenceSuccess("");
    setIsUpdatingConference(true);

    try {
      const payload = {
        name: editConferenceForm.name,
        short_name: editConferenceForm.short_name,
        location: editConferenceForm.location,
        start_date: editConferenceForm.start_date,
        end_date: editConferenceForm.end_date,
        description: editConferenceForm.description,
        is_published: Boolean(editConferenceForm.is_published),
      };

      await updateConference(editingConference.id, payload, token);
      setEditingConference(null);
      setUpdateConferenceSuccess("Conference updated successfully.");
      loadConferences(conferencePage);
    } catch (error) {
      const adminUrl = editingConference?.id ? getAdminConferenceChangeUrl(editingConference.id) : null;
      const suffix = adminUrl ? ` You can also update via admin: ${adminUrl}` : "";
      setUpdateConferenceError((error?.message || "Unable to update conference.") + suffix);
    } finally {
      setIsUpdatingConference(false);
    }
  };

  const handleDeleteConference = async (conference) => {
    if (!conference?.id) {
      return;
    }

    const confirmed = window.confirm(`Delete "${conference.name || "this conference"}"?`);
    if (!confirmed) {
      return;
    }

    setConferenceError("");
    setUpdateConferenceError("");
    setUpdateConferenceSuccess("");
    setCreateConferenceSuccess("");

    try {
      await deleteConference(conference.id, token);
      setViewingConference(null);
      setUpdateConferenceSuccess("Conference deleted successfully.");
      loadConferences(conferencePage);
    } catch (error) {
      const adminUrl = getAdminConferenceDeleteUrl(conference.id);
      setUpdateConferenceError((error?.message || "Unable to delete conference.") + ` You can also delete via admin: ${adminUrl}`);
    }
  };

  return (
    <div className="grid gap-6">
      <SectionCard
        title="Conference"
        action={
          <button
            type="button"
            onClick={() => {
              setCreateConferenceError("");
              setCreateConferenceSuccess("");
              setCreateConferenceForm(createConferenceInitialForm);
              setShowCreateConference(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            Create conference
          </button>
        }
      >
        {createConferenceSuccess ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {createConferenceSuccess}
          </div>
        ) : null}
        {updateConferenceSuccess ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {updateConferenceSuccess}
          </div>
        ) : null}
        {updateConferenceError ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {updateConferenceError}
          </div>
        ) : null}

        <div className="rounded-[24px] bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Conferences</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadConferences(conferencePage)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Refresh
              </button>
              <span className="text-xs text-slate-500">Page {conferencePage}</span>
            </div>
          </div>

          {conferenceError ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {conferenceError}
            </div>
          ) : null}

          {isLoadingConferences ? (
            <div className="mt-3 text-xs text-slate-500">Loading...</div>
          ) : (
            <div className="mt-3 space-y-2">
              {conferences.length ? (
                conferences.map((conference) => (
                  <div
                    key={conference.id || conference.short_name || conference.name}
                    className="rounded-2xl border border-slate-200/70 bg-white px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{conference.name || "Untitled conference"}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {(conference.location || "No location") +
                            " • " +
                            (conference.start_date || "No start date") +
                            " → " +
                            (conference.end_date || "No end date")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveConferenceId(String(conference.id || ""));
                            setSearchParams((current) => {
                              const next = new URLSearchParams(current);
                              if (conference.id) {
                                next.set("conference", String(conference.id));
                              }
                              return next;
                            });
                          }}
                          className={[
                            "rounded-full border px-3 py-1.5 text-xs font-semibold",
                            String(conference.id) === String(activeConferenceId)
                              ? "border-ink bg-ink text-white"
                              : "border-slate-200 bg-white text-slate-700",
                          ].join(" ")}
                        >
                          {String(conference.id) === String(activeConferenceId) ? "Active" : "Set active"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingConference(conference)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            conference.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {conference.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-3 text-xs text-slate-500">
                  No conferences found.
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  disabled={!conferencePagination.previous || isLoadingConferences}
                  onClick={() => loadConferences(Math.max(1, conferencePage - 1))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={!conferencePagination.next || isLoadingConferences}
                  onClick={() => loadConferences(conferencePage + 1)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {showCreateConference ? (
        <CreateConferenceModal
          form={createConferenceForm}
          onChange={handleCreateConferenceChange}
          onSubmit={handleCreateConferenceSubmit}
          onClose={() => setShowCreateConference(false)}
          isSubmitting={isCreatingConference}
          error={createConferenceError}
        />
      ) : null}

      {viewingConference ? (
        <ViewConferenceModal
          conference={viewingConference}
          token={token}
          onClose={() => setViewingConference(null)}
          onEdit={openEditConference}
          onDelete={handleDeleteConference}
        />
      ) : null}

      {editingConference ? (
        <EditConferenceModal
          form={editConferenceForm}
          onChange={handleEditConferenceChange}
          onSubmit={handleEditConferenceSubmit}
          onClose={() => setEditingConference(null)}
          isSubmitting={isUpdatingConference}
          error={updateConferenceError}
        />
      ) : null}

      {showCreateAboutEvent ? (
        <AboutEventModal
          title={editingAboutEvent?.id ? "Update about event" : "Create about event"}
          mode={editingAboutEvent?.id ? "edit" : "create"}
          form={aboutEventForm}
          onChange={handleAboutEventChange}
          onSubmit={handleSaveAboutEvent}
          onClose={() => {
            setShowCreateAboutEvent(false);
            setEditingAboutEvent(null);
          }}
          isSubmitting={isSavingAboutEvent}
          error={aboutEventError}
        />
      ) : null}
    </div>
  );
}
