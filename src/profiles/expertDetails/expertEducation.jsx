import { useState } from "react";
import axiosSecure from "../../components/utils/axiosSecure";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useConfirm } from "../../context/ConfirmContext";
import { useAlert } from "../../context/AlertContext";
import { GoPlus } from "react-icons/go";

export default function EducationPage({ education = [], setExpertData, isDark }) {

  const emptyForm = {
    school: "",
    degree: "",
    field_of_study: "",
    start_year: "",
    end_year: "",
    grade: "",
    description: ""
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
  const openEditModal = (edu) => {
    setForm({ ...edu });
    setEditingId(edu.id);
    setOpenModal(true);
  };

  /* SAVE EDUCATION */
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        end_year: form.end_year ? Number(form.end_year) : null,
        start_year: form.start_year ? Number(form.start_year) : null
      };

      let res;

      if (editingId) {
        // ⭐ UPDATE
        res = await axiosSecure.patch(
          `/v1/experts/education/${editingId}/`,
          payload
        );

        setExpertData((prev) => ({
          ...prev,
          educations: prev.educations.map((e) =>
            e.id === editingId ? res.data : e
          ),
        }));

        showAlert("Education updated", "success");
      } else {
        // ⭐ CREATE
        res = await axiosSecure.post(`/v1/experts/education/`, payload);

        setExpertData((prev) => ({
          ...prev,
          educations: [...prev.educations, res.data],
        }));

        showAlert("Education added", "success");
      }

      setOpenModal(false);
      setForm(emptyForm);
      setEditingId(null);

    } catch (err) {
      console.log("Education save failed:", err);
    }
  };

  /* DELETE EDUCATION */
  const deleteEducation = async (id) => {
    showConfirm({
          title: "Delete education?",
          message: "Are you sure you want to delete this education? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
    
          onConfirm: async () => {
            try {
              await axiosSecure.delete(`/v1/experts/education/${id}/`);
    
              setExpertData((prev) => ({
            ...prev,
            educations: prev.educations.filter((c) => c.id !== id),
          }));
    
              showAlert("education deleted successfully!", "success");
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
        <h2 className="text-xl font-semibold">Education</h2>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          <GoPlus className="text-xl"/>
        </button>
      </div>

      {/* EDUCATION LIST */}
      {(!education || education.length === 0) ? (
        <p className="opacity-70">No education added yet.</p>
      ) : (
        education.map((edu) => (
          <div
            key={edu.id}
            className={`relative p-5 rounded-xl border mb-4 ${cardBg}`}
          >
            {/* Edit/Delete icons */}
            <div className="absolute top-3 right-3 flex gap-3">
              <FiEdit
                size={20}
                className="cursor-pointer  hover:text-red-500"
                onClick={() => openEditModal(edu)}
              />
              <FiTrash2
                size={20}
                className="cursor-pointer  hover:text-red-500"
                onClick={() => deleteEducation(edu.id)}
              />
            </div>

            {/* CARD CONTENT */}
            <div className="space-y-1">

  {/* School Name */}
  <h3 className="text-lg font-semibold">
    {edu.school}
  </h3>

  {/* Degree + Field of Study */}
  <p className="text-sm opacity-80">
    {edu.degree}
    {edu.field_of_study ? ` • ${edu.field_of_study}` : ""}
  </p>

  {/* Duration + Grade */}
  <p className="text-sm opacity-60 mt-1">
    {edu.start_year} — {edu.end_year ? edu.end_year : "Present"}
    {edu.grade ? ` • Grade: ${edu.grade}` : ""}
  </p>

  {/* Description */}
  {edu.description && (
    <p className="text-sm mt-3 leading-relaxed opacity-90">
      {edu.description}
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
              {editingId ? "Edit Education" : "Add Education"}
            </h2>

            <div className="grid gap-3">

               <label className="text-sm opacity-70">Institute <span className="text-red-600">* </span>:</label>
              <input
                
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">Degree <span className="text-red-600">* </span>:</label>
              <input
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">Field of Study <span className="text-red-600">* </span>:</label>
              <input
                value={form.field_of_study}
                onChange={(e) => setForm({ ...form, field_of_study: e.target.value })}
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">Start Year <span className="text-red-600">* </span>:</label>
              <input
                type="number"
                value={form.start_year}
                onChange={(e) => setForm({ ...form, start_year: e.target.value })}
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">End Year</label>
              <input
                type="number"
                value={form.end_year ?? ""}
                onChange={(e) => setForm({ ...form, end_year: e.target.value })}
                className="p-2 border rounded"
              />

             <label className="text-sm opacity-70">Grade <span className="text-red-600">* </span>:</label>
              <input
                
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="p-2 border rounded"
                required
              />

            <label className="text-sm opacity-70">Description</label>
              <textarea
            
                rows="2"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
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
