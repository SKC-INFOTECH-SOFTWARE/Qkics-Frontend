import { useState } from "react";
import Document from "./document";
import MyDownloads from "../components/Documents/MyDownloads";

export default function DocumentsPage({ theme }) {
  const [showDownloads, setShowDownloads] = useState(false);
  const isDark = theme === "dark";


  return (
    <div className={`min-h-screen px-4 max-w-7xl mx-auto `}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-fadeIn">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Resource <span className="text-red-600">Library</span>
          </h1>
          <p className="opacity-50 font-medium leading-relaxed">
            Access curated professional intelligence, technical documentation, and your personal asset collective.
          </p>
        </div>

        {/* Premium Segmented Control Tabs */}
        <div className={`inline-flex flex-wrap justify-center p-1.5 rounded-2xl transition-all shadow-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
          <button
            onClick={() => setShowDownloads(false)}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${!showDownloads
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : isDark ? "text-neutral-500 hover:text-white" : "text-neutral-500 hover:text-black"
              }`}
          >
            All intelligence
          </button>
          <button
            onClick={() => setShowDownloads(true)}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${showDownloads
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : isDark ? "text-neutral-500 hover:text-white" : "text-neutral-500 hover:text-black"
              }`}
          >
            My Downloads
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="animate-fadeIn">
        {!showDownloads ? (
          <Document theme={theme} />
        ) : (
          <div className="max-w-6xl mx-auto">
            <MyDownloads theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}
