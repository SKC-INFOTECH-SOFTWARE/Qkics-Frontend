import { useEffect, useState } from "react";
import useThemeClasses from "../../components/utils/useThemeClasses";
import { useAlert } from "../../context/AlertContext";

export default function SlotForm({
  initialData,
  onSave,
  onCancel,
  isDark,
}) {
  const isEdit = Boolean(initialData);
  const { showAlert } = useAlert();

  const { input, border } = useThemeClasses(isDark);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(true);

  /* ----------------------------
      PREFILL (EDIT MODE)
  ----------------------------- */
  useEffect(() => {
    if (!initialData) return;

    // Convert ISO string (UTC) to local time format YYYY-MM-DDTHH:mm
    const toLocalString = (isoStr) => {
      if (!isoStr) return "";
      const date = new Date(isoStr);
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };

    setStart(toLocalString(initialData.start_datetime));
    setEnd(toLocalString(initialData.end_datetime));
    setDuration(initialData.duration_minutes);
    setPrice(initialData.price);
    setRequiresApproval(initialData.requires_approval);
  }, [initialData]);

  useEffect(() => {
    if (!start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate > startDate) {
      const diffMinutes = (endDate - startDate) / (1000 * 60);
      setDuration(diffMinutes);
    }
  }, [start, end]);

  /* ----------------------------
      SUBMIT
  ----------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!start || !end || price === "" || price === null) {
      showAlert("All fields are required", "error");
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate <= startDate) {
      showAlert("End time must be after start time", "error");
      return;
    }

    const payload = {
      start_datetime: startDate.toISOString(),
      end_datetime: endDate.toISOString(),
      duration_minutes: Number(duration),
      price: Number(price),
      requires_approval: requiresApproval,
    };

    onSave(payload, initialData?.uuid);
  };

  const inputClass = `w-full rounded px-3 py-2 mt-1 border ${input} ${border}`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${isDark ? "text-white" : "text-black"}`}
    >
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Slot" : "Create New Slot"}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            value={start}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setStart(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            value={end}
            min={start || new Date().toISOString().slice(0, 16)}
            onChange={(e) => setEnd(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            disabled
            className={`${inputClass} opacity-70 cursor-not-allowed`}
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Price (₹)
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={requiresApproval}
          onChange={(e) => setRequiresApproval(e.target.checked)}
        />
        Requires approval before booking
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          {isEdit ? "Update Slot" : "Create Slot"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 border rounded ${isDark
              ? "border-neutral-600 hover:bg-neutral-700"
              : "border-neutral-300 hover:bg-gray-100"
            }`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
