import { FaTimes, FaBuilding, FaCheck } from "react-icons/fa";
import { resolveMedia } from "../../../components/utils/mediaUrl";
import useModalEscape from "../../../components/hooks/useModalEscape";

export default function CreateCompanyModal({
  isDark,
  closeModal,
  formData,
  handleInputChange,
  handleFileChange,
  handleSubmit,
  logoPreview,
  coverPreview,
  loading,
}) {
  useModalEscape(closeModal);
  const text = isDark ? "text-white" : "text-black";
  const bgCard = isDark ? "bg-neutral-900" : "bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className={`relative w-full max-w-2xl my-8 p-8 rounded-3xl shadow-2xl ${bgCard} border ${isDark ? "border-white/10" : "border-black/5"}`}>
        <button
          onClick={closeModal}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            isDark ? "hover:bg-white/10 text-neutral-400 hover:text-white" : "hover:bg-black/5 text-neutral-500 hover:text-black"
          }`}
        >
          <FaTimes size={20} />
        </button>

        <div className="mb-8 pr-12">
          <h2 className={`text-2xl font-black tracking-tighter mb-2 ${text}`}>Create Company Profile</h2>
          <p className={`text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Set up your company details to connect with others.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Uploads */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo Upload */}
            <div className="flex-1">
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FaBuilding size={24} className="text-neutral-400" />
                  )}
                </div>
                <label className="cursor-pointer px-4 py-2 bg-red-600/10 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all">
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "logo")} />
                </label>
              </div>
            </div>

            {/* Cover Upload */}
            <div className="flex-1">
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Cover Image
              </label>
              <div className="w-full h-20 rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 relative group">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-neutral-400">Add Cover Image</span>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-xs font-bold">
                  Upload Cover
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "cover")} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Company Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all ${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-black"}`}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Industry *</label>
              <input
                type="text"
                name="industry"
                required
                value={formData.industry}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all ${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-black"}`}
                placeholder="e.g. Technology, Healthcare"
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all ${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-black"}`}
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all ${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-black"}`}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Description *</label>
            <textarea
              name="description"
              required
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none ${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-black"}`}
              placeholder="Tell us about your company..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-neutral-200 text-black hover:bg-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FaCheck />
              )}
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
