import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchExpertSlots,
  createExpertSlot,
  updateExpertSlot,
  deleteExpertSlot,
} from "../../redux/slices/expertSlotsSlice";

import { useAlert } from "../../context/AlertContext";
import { useConfirm } from "../../context/ConfirmContext";

import SlotForm from "./SlotForm";
import SlotCard from "./SlotCard";
import ModalOverlay from "../../components/ui/ModalOverlay";
import { GoPlus } from "react-icons/go";

export default function ExpertSlots({ theme: propTheme }) {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  /* ----------------------------
      REDUX STATE
  ----------------------------- */
  const { data: user, theme: reduxTheme } = useSelector((state) => state.user);
  const { items: slots, loading, error } = useSelector(
    (state) => state.expertSlots
  );

  const theme = propTheme || reduxTheme;
  const isDark = theme === "dark";

  /* ----------------------------
      LOCAL UI STATE
  ----------------------------- */
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  /* ----------------------------
      FETCH SLOTS
  ----------------------------- */
  useEffect(() => {
    if (!user) return;
    if (!user.uuid) return;
    if (user.user_type !== "expert") return;

    dispatch(fetchExpertSlots(user.uuid));
  }, [user, dispatch]);


  /* ----------------------------
      CREATE / UPDATE SLOT
  ----------------------------- */
  const handleSave = async (payload, slotUuid = null) => {
    try {
      if (slotUuid) {
        await dispatch(
          updateExpertSlot({ slotUuid, payload })
        ).unwrap();
        showAlert("Slot updated successfully", "success");
      } else {
        await dispatch(createExpertSlot(payload)).unwrap();
        showAlert("Slot created successfully", "success");
      }

      setShowModal(false);
      setEditingSlot(null);


    } catch (err) {
      if (typeof err === "object") {
        const msg =
          err.start_datetime?.[0] ||
          err.non_field_errors?.[0] ||
          "Save failed";
        showAlert(msg, "error");
      } else {
        showAlert(err, "error");
      }
    }
  };

  /* ----------------------------
      DELETE SLOT
  ----------------------------- */
  const handleDelete = (slotUuid) => {
    showConfirm({
      title: "Delete Slot",
      message: "Are you sure you want to delete this slot?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",

      onConfirm: async () => {
        try {
          await dispatch(deleteExpertSlot(slotUuid)).unwrap();
          showAlert("Slot deleted successfully", "success");
        } catch (err) {
          showAlert(
            typeof err === "string" ? err : "Delete failed",
            "error"
          );
        }
      },
    });
  };

  const sortedSlots = useMemo(() => {
    return [...slots].sort(
      (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
    );
  }, [slots]);



  /* ----------------------------
      UI
  ----------------------------- */
  return (
    <div className={`min-h-screen px-4 py-4 md:px-8 ${isDark ? "bg-[#0a0a0a]" : "bg-[#f8f9fa]"}`}>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className={`premium-card p-8 md:p-12 mb-8 ${isDark ? "bg-neutral-900" : "bg-white"}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-black"}`}>
                Manage <span className="text-red-600">Booking Slots</span>
              </h1>
              <p className={`text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Set your availability for consultation sessions.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingSlot(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-600/20"
            >
              <GoPlus size={18} /> Add Slot
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`text-xs font-black uppercase tracking-widest opacity-50 ${isDark ? "text-white" : "text-black"}`}>Loading Slots...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
            <p className="font-bold">{error}</p>
          </div>
        ) : slots.length === 0 ? (
          <div className={`flex flex-col items-center justify-center p-20 rounded-3xl border border-dashed ${isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-300 text-neutral-400"}`}>
            <p className="font-bold text-lg mb-2">No Slots Available</p>
            <p className="text-sm">Create your first booking slot to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSlots.map((slot) => {
              // ✅ Normalize: API may return 'uuid' or 'id' as the primary key.
              const slotId = slot.uuid ?? slot.id;
              return (
                <SlotCard
                  key={slotId}
                  slot={{ ...slot, uuid: slotId }}
                  isDark={isDark}
                  onEdit={() => {
                    setEditingSlot({ ...slot, uuid: slotId });
                    setShowModal(true);
                  }}
                  onDelete={() => handleDelete(slotId)}
                />
              );
            })}
          </div>
        )}

      </div>

      {/* ======================
          MODAL
      ======================= */}
      {showModal && (
        <ModalOverlay close={() => setShowModal(false)}>
          <div className={`w-full max-w-xl p-8 rounded-3xl shadow-2xl relative ${isDark ? "bg-neutral-900 border border-neutral-800" : "bg-white"}`}>
            <SlotForm
              initialData={editingSlot}
              onSave={handleSave}
              onCancel={() => {
                setShowModal(false);
                setEditingSlot(null);
              }}
              isDark={isDark}
            />
          </div>
        </ModalOverlay>
      )}


    </div>
  );
}