import { useState } from "react";
import axiosSecure from "../../components/utils/axiosSecure";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useConfirm } from "../../context/ConfirmContext";
import { useAlert } from "../../context/AlertContext";
import { GoPlus } from "react-icons/go";

export default function ExperiencePage({ experiences = [], setExpertData, isDark }) {
  
  const emptyForm = {
    job_title: "",
    company: "",
    employment_type: "",
    location: "",
    start_date: "",
    end_date: "",
    description: ""
  };

  const { showConfirm } = useConfirm();
  const { showAlert } = useAlert();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const cardBg = isDark
    ? "bg-neutral-900 border-neutral-700 text-white"
    : "bg-white border-neutral-300 text-black";

  /* OPEN ADD MODAL */
  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpenModal(true);
  };

  /* OPEN EDIT MODAL */
  const openEditModal = (exp) => {
    setEditingId(exp.id);
    setForm({ ...exp });
    setOpenModal(true);
  };

  /* SAVE EXPERIENCE (ADD OR UPDATE) */
  const handleSubmit = async () => {
    try {
      const payload = {
        job_title: form.job_title,
        company: form.company,
        employment_type: form.employment_type,
        location: form.location,
        start_date: form.start_date,
        end_date:
          form.end_date === "" ||
          form.end_date === null ||
          form.end_date === undefined
            ? null
            : form.end_date,
        description: form.description,
      };

      let res;

      if (editingId) {
        // ⭐ UPDATE using PATCH with ID
        res = await axiosSecure.patch(
          `/v1/experts/experience/${editingId}/`,
          payload
        );

        setExpertData((prev) => ({
          ...prev,
          experiences: prev.experiences.map((exp) =>
            exp.id === editingId ? res.data : exp
          ),
        }));

        showAlert("Experience updated successfully!", "success");
      } else {
        // ⭐ CREATE using POST
        res = await axiosSecure.post(`/v1/experts/experience/`, payload);

        setExpertData((prev) => ({
          ...prev,
          experiences: [...prev.experiences, res.data],
        }));

        showAlert("Experience added successfully!", "success");
      }

      setOpenModal(false);
      setForm(emptyForm);
      setEditingId(null);

    } catch (err) {
      console.log("Experience save failed:", err);
    }
  };

  /* DELETE EXPERIENCE */

   const deleteExperience = async (id) => {
    showConfirm({
          title: "Delete experience?",
          message: "Are you sure you want to delete this experience? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
    
          onConfirm: async () => {
            try {
              await axiosSecure.delete(`/v1/experts/experience/${id}/`);
    
              setExpertData((prev) => ({
            ...prev,
            experiences: prev.experiences.filter((c) => c.id !== id),
          }));
    
              showAlert("experience deleted successfully!", "success");
            } catch (err) {
              console.log("Delete error:", err);
              showAlert("Delete failed!", "error");
            }
          },
        });
  };

  return (
    <div>

      {/* Add Button */}
      {/* HEADING + ADD BUTTON */}
<div className="flex items-center justify-between mb-6">
  <h2 className="text-xl font-semibold">Your Experience</h2>

  <button
    onClick={openAddModal}
    className="px-4 py-2 rounded bg-red-600 text-white"
  >
    <GoPlus className="text-xl"/>
  </button>
</div>


      {experiences.length === 0 ? (
        <p className="opacity-70">No experience added yet.</p>
      ) : (
        experiences.map((exp) => (
          <div
            key={exp.id}
            className={`relative p-5 rounded-xl border mb-4 ${cardBg}`}
          >
            {/* Edit/Delete icons */}
            <div className="absolute top-3 right-3 flex gap-3">
              <FiEdit
                className="cursor-pointer  hover:text-red-500"
                size={20}
                onClick={() => openEditModal(exp)}
              />
              <FiTrash2
                className="cursor-pointer  hover:text-red-500"
                size={20}
                onClick={() => deleteExperience(exp.id)}
              />
            </div>

            <div className="space-y-1">

  {/* Job Title */}
  <h3 className="text-lg font-semibold">
    {exp.job_title}
  </h3>

  {/* Company + Location */}
  <p className="text-sm opacity-80">
    {exp.company}
    {exp.location ? ` • ${exp.location}` : ""}
  </p>

  {/* Employment Type + Duration */}
  <p className="text-sm opacity-60">
    {exp.employment_type.replace("_", " ").toUpperCase()} 
    {" • "}
    {exp.start_date} — {exp.end_date ? exp.end_date : "Present"}
  </p>

  {/* Description */}
  {exp.description && (
    <p className="text-sm mt-3 leading-relaxed opacity-90">
      {exp.description}
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
              isDark ? "bg-neutral-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Experience" : "Add Experience"}
            </h2>

            <div className="grid gap-3">

              <label className="text-sm opacity-70">Job Title <span className="text-red-600">* </span>:</label>
              <input
             
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">Company <span className="text-red-600">* </span>:</label>
              <input
           
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">Location <span className="text-red-600">* </span>:</label>
              <input
              
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="p-2 border rounded"
                required
              />

              <label className="text-sm opacity-70">Employment Type <span className="text-red-600">* </span>:</label>
              <select
                value={form.employment_type}
                onChange={(e) =>
                  setForm({ ...form, employment_type: e.target.value })
                }
                className="p-2 border rounded"
                required
              >
                <option value="">Select Employment Type</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm opacity-70">Start Date <span className="text-red-600">* </span>:</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                    className="p-2 border rounded w-full"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm opacity-70">End Date</label>
                  <input
                    type="date"
                    value={form.end_date ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                    className="p-2 border rounded w-full"
                  />
                </div>
              </div>

              <label className="text-sm opacity-70">Description</label>
              <textarea
           
                rows="4"
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
