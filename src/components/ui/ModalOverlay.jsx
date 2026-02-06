function ModalOverlay({ children, close, bgClass = "bg-black/40" }) {
    return (
        <div
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) close();
            }}
            className={`fixed inset-0 ${bgClass} flex items-center justify-center z-[100] px-4 py-6`}
        >
            <div className="w-full flex justify-center max-h-full overflow-y-auto" onMouseDown={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

export default ModalOverlay;
