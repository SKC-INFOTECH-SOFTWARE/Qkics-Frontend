import { useState } from "react";
import axiosSecure from "../../components/utils/axiosSecure";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useAlert } from "../../context/AlertContext";
import { useConfirm } from "../../context/ConfirmContext";
import { GoPlus } from "react-icons/go";

export default function HonorsPage({ honors_awards = [], setExpertData, isDark }) {
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const emptyForm = {
    title: "",
    issuer: "",
    issue_date: "",
    description: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const cardBg = isDark
    ? "bg-neutral-900 border-neutral-700 text-white"
    : "bg-white border-neutral-300 ";

  /* OPEN ADD MODAL */
  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpenModal(true);
  };

  /* OPEN EDIT MODAL */
  const openEditModal = (honor) => {
    setForm({ ...honor });
    setEditingId(honor.id);
    setOpenModal(true);
  };

  /* SAVE HONOR */
  const handleSubmit = async () => {
    try {
      const payload = {
        title: form.title,
        issuer: form.issuer,
        issue_date: form.issue_date,
        description: form.description,
      };

      let res;

      if (editingId) {
        // UPDATE (PATCH)
        res = await axiosSecure.patch(`/v1/experts/honors/${editingId}/`, payload);

        setExpertData((prev) => ({
          ...prev,
          honors_awards: (prev.honors_awards || []).map((h) =>
            h.id === editingId ? res.data : h
          ),
        }));

        showAlert("Honor updated successfully!", "success");
      } else {
        // CREATE
        res = await axiosSecure.post(`/v1/experts/honors/`, payload);

        setExpertData((prev) => ({
          ...prev,
          honors_awards: [...(prev.honors_awards || []), res.data],
        }));

        showAlert("Honor added successfully!", "success");
      }

      setOpenModal(false);
      setForm(emptyForm);
      setEditingId(null);

    } catch (err) {
      console.log("Honor save failed:", err);
      showAlert("Failed to save honor!", "error");
    }
  };

  /* DELETE HONOR */
  const deleteHonor = async (id) => {
    showConfirm({
      title: "Delete Honor/Award?",
      message: "Are you sure you want to delete this honor?",
      confirmText: "Delete",
      cancelText: "Cancel",

      onConfirm: async () => {
        try {
          await axiosSecure.delete(`/v1/experts/honors/${id}/`);

          setExpertData((prev) => ({
            ...prev,
            honors_awards: (prev.honors_awards || []).filter((h) => h.id !== id),
          }));

          showAlert("Honor deleted successfully!", "success");
        } catch (err) {
          console.log("Delete failed:", err);
          showAlert("Delete failed!", "error");
        }
      },
    });
  };

  return (
    <div >

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Honors & Awards</h2>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded shadow-2xl bg-red-600 text-white"
        >
          <GoPlus className="text-xl"/>
        </button>
      </div>

      {/* HONORS LIST */}
      {(!honors_awards || honors_awards.length === 0) ? (
        <p className="opacity-70">No honors added yet.</p>
      ) : (
        honors_awards.map((h) => (
          <div
            key={h.id}
            className={`relative p-5 rounded-xl border mb-4 ${cardBg}`}
          >
            {/* Edit/Delete */}
            <div className="absolute top-3 right-3 flex gap-3">
              <FiEdit
                size={20}
                className="cursor-pointer  hover:text-red-500"
                onClick={() => openEditModal(h)}
              />
              <FiTrash2
                size={20}
                className="cursor-pointer  hover:text-red-500"
                onClick={() => deleteHonor(h.id)}
              />
            </div>

            {/* CONTENT */}
            <div className="space-y-1">

  {/* Award Title */}
  <h3 className="text-lg font-semibold">
    {h.title}
  </h3>

  {/* Issuer */}
  <p className="text-sm opacity-80">
    {h.issuer || "Unknown Issuer"}
  </p>

  {/* Issued Date */}
  <p className="text-sm opacity-60 mt-1">
    Issued {h.issue_date}
  </p>

  {/* Description */}
  {h.description && (
    <p className="text-sm mt-3 leading-relaxed opacity-90">
      {h.description}
    </p>
  )}

</div>

          </div>
        ))
      )}

      {/* MODAL */}
      {openModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={() => setOpenModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg p-6 rounded-xl shadow-lg ${
              isDark ? "bg-neutral-800 text-white" : "bg-white "
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Honor" : "Add Honor"}
            </h2>

            <div className="grid gap-3">
                <label className="text-sm opacity-70">Title <span className="text-red-600">* </span>:</label>
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="p-2 border rounded"
                required
              />

            <label className="text-sm opacity-70">Issuer :</label>
              <input
                placeholder="Issuer"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                className="p-2 border rounded"
              />

              <label className="text-sm opacity-70">Issue Date <span className="text-red-600">* </span>:</label>
              <input
                type="date"
                value={form.issue_date}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                className="p-2 border rounded"
                required
              />

            <label className="text-sm opacity-70">Description :</label>
              <textarea
                placeholder="Description"
                rows="4"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="p-2 border rounded"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded bg-neutral-500 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
