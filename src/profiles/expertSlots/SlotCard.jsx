import { MdEdit, MdDelete } from "react-icons/md";
import { MdOutlineSchedule } from "react-icons/md";
import useThemeClasses from "../../components/utils/useThemeClasses";

export default function SlotCard({
  slot,
  onEdit,
  onDelete,
  onReschedule,
  isDark,
}) {
  const { border1, bg, card } = useThemeClasses(isDark);
  const start = new Date(slot.start_datetime);
  const end = new Date(slot.end_datetime);

  // ✅ BACKEND IS SOURCE OF TRUTH
  const isAvailable = slot.is_available === true;

  const sameDay = start.toLocaleDateString() === end.toLocaleDateString();

  return (
    <div
      className={`p-4 rounded-xl shadow-md space-y-3 border transition-all hover:shadow-lg ${card} ${isDark ? "text-white" : "text-black"
        }`}
      style={{ border: border1 }}
    >
      {/* TIME */}
      <div className="font-semibold text-lg flex items-center gap-2">
        <MdOutlineSchedule className="text-gray-400" />
        <span>
          {start.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          • {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {" – "}
          {!sameDay && `${end.toLocaleDateString()} • `}
          {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* PRICE */}
      <div className="text-sm opacity-80 flex gap-3">
        <span className="font-medium text-red-600 dark:text-red-400">
          ₹{slot.price}
        </span>
        <span className="text-gray-500">•</span>
        <span>{slot.duration_minutes} mins duration</span>
      </div>

      {/* STATUS */}
      <div className="flex flex-wrap gap-2 text-xs pt-1">
        <span
          className={`px-2 py-1 rounded-full font-semibold ${slot.status === "ACTIVE"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}
        >
          {slot.status}
        </span>

        <span
          className={`px-2 py-1 rounded-full font-semibold ${isAvailable
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
        >
          {isAvailable ? "Available" : "Booked"}
        </span>
        {/* {slot.requires_approval && (
          <span className="px-2 py-1 rounded-full font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            Approval Needed
          </span>
        )} */}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        {isAvailable ? (
          <>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <MdEdit size={16} /> Edit
            </button>

            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium border rounded-lg text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <MdDelete size={16} /> Delete
            </button>
          </>
        ) : (
          <button
            onClick={onReschedule}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium border rounded-lg text-indigo-600 border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <MdOutlineSchedule size={16} /> Reschedule
          </button>
        )}
      </div>
    </div>
  );
}
