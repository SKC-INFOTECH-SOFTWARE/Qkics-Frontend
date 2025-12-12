import { useState } from "react";
import axiosSecure from "../../components/utils/axiosSecure";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useConfirm } from "../../context/ConfirmContext";
import { useAlert } from "../../context/AlertContext";
import { GoPlus } from "react-icons/go";

export default function CertificationPage({ certifications = [], setExpertData, isDark }) {

  const emptyForm = {
    name: "",
    issuing_organization: "",
    issue_date: "",
    expiration_date: "",
    credential_id: "",
    credential_url: ""
  };

  const { showConfirm } = useConfirm();
  const { showAlert } = useAlert();

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
  const openEditModal = (cert) => {
    setForm({ ...cert });
    setEditingId(cert.id);
    setOpenModal(true);
  };

  /* SAVE CERTIFICATION */
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        expiration_date:
          form.expiration_date === "" ? null : form.expiration_date,
      };

      let res;

      if (editingId) {
        // UPDATE
        res = await axiosSecure.patch(
          `/v1/experts/certifications/${editingId}/`,
          payload
        );

        setExpertData((prev) => ({
          ...prev,
          certifications: prev.certifications.map((c) =>
            c.id === editingId ? res.data : c
          ),
        }));

        showAlert("Certification updated", "success");
      } else {
        // CREATE
        res = await axiosSecure.post(`/v1/experts/certifications/`, payload);

        setExpertData((prev) => ({
          ...prev,
          certifications: [...prev.certifications, res.data],
        }));

        showAlert("Certification added", "success");
      }

      setOpenModal(false);
      setForm(emptyForm);
      setEditingId(null);

    } catch (err) {
      console.log("Certification save failed:", err);
    }
  };

  /* DELETE CERTIFICATION */


  const deleteCertification = async (id) => {
    showConfirm({
      title: "Delete certification?",
      message: "Are you sure you want to delete this certification? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",

      onConfirm: async () => {
        try {
          await axiosSecure.delete(`/v1/experts/certifications/${id}/`);

          setExpertData((prev) => ({
        ...prev,
        certifications: prev.certifications.filter((c) => c.id !== id),
      }));

          showAlert("Certification deleted successfully!", "success");
        } catch (err) {
          console.log("Delete error:", err);
          showAlert("Delete failed!", "error");
        }
      },
    });
  };

  return (
    <div >

      {/* HEADING + ADD BUTTON */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Certifications</h2>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          <GoPlus className="text-xl"/>
        </button>
      </div>

      {/* CERTIFICATIONS LIST */}
      {(!certifications || certifications.length === 0) ? (
        <p className="opacity-70">No certifications added yet.</p>
      ) : (
        certifications.map((cert) => (
          <div
            key={cert.id}
            className={`relative p-5 rounded-xl border mb-4 ${cardBg}`}
          >
            {/* Edit/Delete icons */}
            <div className="absolute top-3 right-3 flex gap-3">
              <FiEdit
                size={20}
                className="cursor-pointer  hover:text-red-500"
                onClick={() => openEditModal(cert)}
              />
              <FiTrash2
                size={20}
                className="cursor-pointer  hover:text-red-500"
                onClick={() => deleteCertification(cert.id)}
              />
            </div>

            {/* CARD CONTENT */}
            <div className="space-y-1">

  {/* Certification Name */}
  <h3 className="text-lg font-semibold">
    {cert.name}
  </h3>

  {/* Issuing Organization */}
  <p className="text-sm opacity-80">
    {cert.issuing_organization}
  </p>

  {/* Issued + Expiration */}
  <p className="text-sm opacity-60 mt-1">
    Issued {cert.issue_date}
    {cert.expiration_date
      ? ` • Expires ${cert.expiration_date}`
      : " • No Expiration"}
  </p>

  {/* Credential ID */}
  {cert.credential_id && (
    <p className="text-sm opacity-70">
      Credential ID: {cert.credential_id}
    </p>
  )}

  {/* Credential URL */}
  {cert.credential_url && (
    <p className="text-sm mt-2">
      <a
        href={cert.credential_url}
        target="_blank"
        className="text-blue-400 underline"
      >
        {cert.credential_url}
      </a>
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
              {editingId ? "Edit Certification" : "Add Certification"}
            </h2>

            <div className="grid gap-3">

              <label className="text-sm opacity-70">Certification Name <span className="text-red-600">* </span>:</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">Issuing Organization <span className="text-red-600">* </span>:</label>
              <input
                value={form.issuing_organization}
                onChange={(e) =>
                  setForm({ ...form, issuing_organization: e.target.value })
                }
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">Issue Date <span className="text-red-600">* </span>:</label>
              <input
                type="date"
                value={form.issue_date}
                onChange={(e) =>
                  setForm({ ...form, issue_date: e.target.value })
                }
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">Expiration Date</label>
              <input
                type="date"
                value={form.expiration_date ?? ""}
                onChange={(e) =>
                  setForm({ ...form, expiration_date: e.target.value })
                }
                className="p-2 border rounded"
              />

              <label className="text-sm opacity-70">Credential ID</label>
              <input
                value={form.credential_id}
                onChange={(e) =>
                  setForm({ ...form, credential_id: e.target.value ?? "" })
                }
                className="p-2 border rounded"
              />

              <label className="text-sm opacity-70">Credential URL</label>
              <input
                placeholder="Ex : http://localhost:5173/expert"
                value={form.credential_url}
                onChange={(e) =>
                  setForm({ ...form, credential_url: e.target.value })
                }
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
