import { useEffect, useState } from "react";
import { useAlert } from "../../context/AlertContext";

export default function InvestorSlotForm({
  initialData,
  onSave,
  onCancel,
  isDark,
}) {
  const isEdit = Boolean(initialData);
  const { showAlert } = useAlert();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [duration, setDuration] = useState(30);

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

    if (!start || !end) {
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
    };

    onSave(payload, initialData?.uuid);
  };

  const inputClass = `w-full bg-transparent border-b-2 font-medium focus:outline-none transition-all pb-2 ${isDark
    ? "border-white/20 focus:border-red-500 text-white placeholder-neutral-600"
    : "border-black/10 focus:border-red-500 text-black placeholder-neutral-400"
    }`;

  const labelClass = `block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? "text-neutral-500" : "text-neutral-400"}`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`${isDark ? "text-white" : "text-black"}`}
    >
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-black uppercase tracking-tight">
          {isEdit ? "Edit" : "Create"} <span className="text-red-600">Slot</span>
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className={`text-2xl hover:text-red-500 transition-colors ${isDark ? "text-white" : "text-black"}`}
        >
          &times;
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className={labelClass}>
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
          <label className={labelClass}>
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
          <label className={labelClass}>
            Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            disabled
            className={`${inputClass} opacity-50 cursor-not-allowed`}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
        >
          {isEdit ? "Update Slot" : "Create Slot"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 py-3 border rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDark
            ? "border-white/10 hover:bg-white/5 text-white"
            : "border-black/10 hover:bg-black/5 text-black"
            }`}
        >
          Cancel
        </button>
      </div>
    </form >
  );
}
