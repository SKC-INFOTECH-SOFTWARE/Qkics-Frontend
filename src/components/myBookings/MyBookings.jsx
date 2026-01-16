import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdOutlineSchedule, MdPerson, MdOutlinePayments, MdChatBubbleOutline, MdOutlineTimer } from "react-icons/md";

import axiosSecure from "../utils/axiosSecure";
import useThemeClasses from "../utils/useThemeClasses";
import { useAlert } from "../../context/AlertContext";

export default function MyBookings() {
  const { theme, data: user } = useSelector((state) => state.user);
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const { card, border, border1 } = useThemeClasses(isDark);
  const { showAlert } = useAlert();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH BOOKINGS ---------------- */
  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const url =
        user.user_type === "expert"
          ? "/v1/bookings/?as_expert=true"
          : "/v1/bookings/";

      const res = await axiosSecure.get(url);

      // Sort by start_datetime (ascending)
      const sorted = [...res.data].sort(
        (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
      );

      setBookings(sorted);
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings");
      showAlert("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STATUS LABEL ---------------- */
  const getStatusConfig = (booking) => {
    const status = (booking.cancelled_at ? "CANCELLED" :
      booking.declined_at ? "DECLINED" :
        booking.completed_at ? "COMPLETED" :
          booking.confirmed_at ? "CONFIRMED" :
            booking.paid_at ? "PAID" : booking.status).toUpperCase();

    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return { label: status, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      case "PAID":
        return { label: status, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      case "PENDING":
        return { label: status, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "CANCELLED":
      case "DECLINED":
        return { label: status, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" };
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-neutral-900 text-white" : "bg-white text-black"}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium">Loading bookings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-neutral-900 text-white" : "bg-white text-black"}`}>
        <div className="text-center p-8 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button onClick={fetchBookings} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 px-6 ${isDark ? "bg-neutral-900 text-white" : "bg-white text-black"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user.user_type === "expert" ? "Client Bookings" : "My Sessions"}
            </h1>
            <p className="opacity-60 text-sm mt-1">Manage and track your expert consultations</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-red-600 rounded-full pulse"></span>
            {bookings.length} {bookings.length === 1 ? 'Session' : 'Sessions'}
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${isDark ? "border-neutral-800" : "border-neutral-200"}`}>
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdOutlineSchedule className="text-3xl opacity-30" />
            </div>
            <h3 className="text-xl font-semibold mb-1">No bookings found</h3>
            <p className="opacity-60">Your upcoming sessions will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              const status = getStatusConfig(booking);
              const startDate = new Date(booking.start_datetime);
              const endDate = new Date(booking.end_datetime);

              return (
                <div
                  key={booking.uuid}
                  className={`group rounded-2xl p-6 border transition-all hover:shadow-xl hover:translate-y-[-2px] ${card} ${isDark ? "border-neutral-800" : "border-neutral-200"}`}
                  style={{ border: border1 }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                        <MdPerson size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">
                          {user.user_type === "expert" ? booking.user_name : booking.expert_name}
                        </h4>
                        <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-red-600 dark:text-red-400">
                        <MdOutlineSchedule size={20} />
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold">{startDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <p className="opacity-70">
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-2">
                        <MdOutlineTimer className="text-gray-400" />
                        <span className="text-sm">
                          <span className="opacity-60">Duration:</span> {booking.duration_minutes}m
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdOutlinePayments className="text-gray-400" />
                        <span className="text-sm">
                          <span className="opacity-60">Price:</span> ₹{booking.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.chat_room_id && (
                    <div className="mt-8">
                      <button
                        onClick={() => navigate(`/chat/${booking.chat_room_id}`)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all active:scale-[0.98] shadow-lg shadow-red-600/20"
                      >
                        <MdChatBubbleOutline size={20} />
                        Open Chat
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
