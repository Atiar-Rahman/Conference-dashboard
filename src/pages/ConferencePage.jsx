import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const token = readStoredAuth()?.access;

  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  // LOAD DATA
  const loadConferences = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getConferences(token);
      setConferences(data?.results || data || []);
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to load conferences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConferences();
  }, [token]);

  // FORM CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // CREATE
  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setOpenModal(true);
  };

  // EDIT
  const openEdit = (conference) => {
    setEditing(conference);

    setForm({
      name: conference.name || "",
      short_name: conference.short_name || "",
      location: conference.location || "",
      start_date: conference.start_date || "",
      end_date: conference.end_date || "",
      description: conference.description || "",
      is_published: conference.is_published || false,
    });

    setOpenModal(true);
  };

  // CLOSE
  const closeModal = () => {
    setOpenModal(false);
    setEditing(null);
    setForm(initialForm);
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editing) {
        await updateConference(editing.id, form, token);
      } else {
        await createConference(form, token);
      }

      await loadConferences();
      closeModal();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to save conference");
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this conference?");
    if (!ok) return;

    try {
      await deleteConference(id, token);
      await loadConferences();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to delete conference");
    }
  };

  // OPEN DETAILS PAGE
  const handleOpenConference = (id) => {
    navigate(`/conference/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Conference</h1>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          <Plus size={18} />
          Create Conference
        </button>
      </div>

      {/* LIST */}
      <div className="rounded-[30px] bg-white p-6 shadow-panel">
        {loading ? (
          <p>Loading...</p>
        ) : conferences.length === 0 ? (
          <p className="text-slate-500">No conference found</p>
        ) : (
          <div className="space-y-4">
            {conferences.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenConference(item.id)}
                className="cursor-pointer rounded-3xl border p-5 transition hover:border-black hover:shadow-md"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.location}</p>
                    <p className="text-sm text-slate-500">
                      {item.start_date} → {item.end_date}
                    </p>

                    {item.is_published ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={16} /> Published
                      </span>
                    ) : (
                      <span className="text-orange-600 flex items-center gap-1">
                        <Circle size={16} /> Draft
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(item)}>
                      <Pencil size={18} />
                    </button>

                    <button onClick={() => handleDelete(item.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 grid place-items-center bg-black/40">
          <div className="w-full max-w-2xl bg-white p-6 rounded-2xl">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? "Update" : "Create"} Conference
              </h2>
              <button onClick={closeModal}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 w-full" />
              <input name="short_name" value={form.short_name} onChange={handleChange} placeholder="Short Name" className="border p-2 w-full" />
              <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="border p-2 w-full" />

              <div className="flex gap-2">
                <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="border p-2 w-full" />
                <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="border p-2 w-full" />
              </div>

              <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full" />

              <label className="flex gap-2">
                <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} />
                Published
              </label>

              <button className="bg-black text-white w-full p-3 rounded-xl">
                {saving ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}