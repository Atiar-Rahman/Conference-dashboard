import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Circle,
} from "lucide-react";

import { readStoredAuth } from "../lib/authStorage";

import {
  createConference,
  deleteConference,
  getConferences,
  updateConference,
} from "../lib/api";

const initialForm = {
  name: "",
  short_name: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
  is_published: false,
};

export default function ConferencePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = readStoredAuth()?.access;

  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const shouldOpenCreateModal =
    searchParams.get("create") === "true";

  // only auto redirect from /conference root
  const shouldAutoOpen =
    location.pathname === "/conference" &&
    !shouldOpenCreateModal;

  const loadConferences = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const data = await getConferences(token);
      console.log("conference data:", data);

      setConferences(data?.results || data || []);
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to load conferences");
    } finally {
      setLoading(false);
    }
  };

  // load
  useEffect(() => {
    if (token) {
      loadConferences();
    }
  }, [token]);

  // open create modal
  useEffect(() => {
    if (shouldOpenCreateModal) {
      setEditing(null);
      setForm(initialForm);
      setOpenModal(true);
    }
  }, [shouldOpenCreateModal]);

  // auto open conference details page
  useEffect(() => {
    if (loading) return;
    if (!shouldAutoOpen) return;
    if (!conferences.length) return;

    const storedConferenceId = readActiveConferenceId();

    const matchingConference = conferences.find(
      (conference) =>
        String(conference.id) ===
        String(storedConferenceId)
    );

    const targetConference =
      matchingConference || conferences[0];

    // if (targetConference?.id) {
    //   navigate(`/conference/${targetConference.id}`, {
    //     replace: true,
    //   });
    // }
  }, [
    conferences,
    loading,
    navigate,
    shouldAutoOpen,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setOpenModal(true);
  };

  const openEdit = (conference) => {
    setEditing(conference);

    setForm({
      name: conference.name || "",
      short_name: conference.short_name || "",
      location: conference.location || "",
      start_date: conference.start_date || "",
      end_date: conference.end_date || "",
      description: conference.description || "",
      is_published:
        conference.is_published || false,
    });

    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditing(null);
    setForm(initialForm);

    navigate("/conference", {
      replace: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editing) {
        await updateConference(
          editing.id,
          form,
          token
        );

        writeActiveConferenceId(editing.id);
      } else {
        const created =
          await createConference(
            form,
            token
          );

        if (created?.id) {
          writeActiveConferenceId(created.id);
        }
      }

      await loadConferences();
      closeModal();
    } catch (error) {
      console.error(error);
      alert(
        error?.message ||
        "Failed to save conference"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Delete this conference?"
    );

    if (!ok) return;

    try {
      await deleteConference(id, token);

      const activeConferenceId =
        readActiveConferenceId();

      if (
        String(activeConferenceId) ===
        String(id)
      ) {
        clearActiveConferenceId();
      }

      await loadConferences();
    } catch (error) {
      console.error(error);
      alert(
        error?.message ||
        "Failed to delete conference"
      );
    }
  };

  const handleOpenConference = (
    conferenceId
  ) => {
    writeActiveConferenceId(conferenceId);

    navigate(`/conference/${conferenceId}`);
  };

  return (
    <div className="space-y-6">
      {/* top */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            Conference
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create / Update / Delete
            conferences
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          <Plus size={18} />
          Create Conference
        </button>
      </div>

      {/* list */}
      <div className="rounded-[30px] bg-white p-6 shadow-panel">
        {loading ? (
          <p>Loading...</p>
        ) : conferences.length === 0 ? (
          <p className="text-slate-500">
            No conference found
          </p>
        ) : (
          <div className="space-y-4">
            {conferences.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  handleOpenConference(
                    item.id
                  )
                }
                className="cursor-pointer rounded-3xl border border-slate-200 p-5 transition hover:border-black hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {item.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {item.location}
                    </p>

                    <p className="text-sm text-slate-500">
                      {item.start_date} →{" "}
                      {item.end_date}
                    </p>

                    {item.is_published ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        <CheckCircle2
                          size={16}
                        />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                        <Circle size={16} />
                        Draft
                      </span>
                    )}
                  </div>

                  <div
                    className="flex gap-2"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <button
                      onClick={() =>
                        openEdit(item)
                      }
                      className="rounded-2xl bg-slate-100 p-3 hover:bg-slate-200"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="rounded-2xl bg-red-100 p-3 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-[30px] bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {editing
                  ? "Update Conference"
                  : "Create Conference"}
              </h2>

              <button onClick={closeModal}>
                <X />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                required
                className="w-full rounded-2xl border p-4"
              />

              <input
                name="short_name"
                value={form.short_name}
                onChange={handleChange}
                placeholder="Short Name"
                required
                className="w-full rounded-2xl border p-4"
              />

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location"
                required
                className="w-full rounded-2xl border p-4"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                  className="rounded-2xl border p-4"
                />

                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  required
                  className="rounded-2xl border p-4"
                />
              </div>

              <textarea
                rows={5}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full rounded-2xl border p-4"
              />

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={form.is_published}
                  onChange={handleChange}
                />
                Published
              </label>

              <button
                disabled={saving}
                className="w-full rounded-2xl bg-black py-4 font-medium text-white disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update Conference"
                    : "Create Conference"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}