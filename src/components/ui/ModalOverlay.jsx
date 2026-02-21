import { createPortal } from "react-dom";
import { useEffect } from "react";

function ModalOverlay({ children, close, bgClass = "bg-black/50 backdrop-blur-sm" }) {
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] overflow-y-auto ${bgClass} animate-fadeIn`}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) close();
            }}
        >
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div
                    className="relative w-full flex justify-center transform transition-all"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ModalOverlay;
