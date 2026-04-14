import { useEffect } from "react";

/**
 * Hook to handle Escape key press to close modals or dropdowns.
 * @param {Function} onClose - Callback function to call when Escape is pressed.
 * @param {boolean} active - Whether the listener should be active (e.g. if modal is open).
 */
export default function useModalEscape(onClose, active = true) {
    useEffect(() => {
        if (!active) return;

        const handleEsc = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose, active]);
}
