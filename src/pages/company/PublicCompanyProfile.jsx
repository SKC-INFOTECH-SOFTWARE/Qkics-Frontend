import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaBuilding, FaMapMarkerAlt, FaGlobe, FaBriefcase, FaArrowLeft, FaChevronRight } from "react-icons/fa";
import axiosSecure from "../../components/utils/axiosSecure";
import { resolveMedia } from "../../components/utils/mediaUrl";
import CompanyPosts from "./components/CompanyPosts";
import CompanyMembers from "./components/CompanyMembers";

export default function PublicCompanyProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme, data: loggedUser } = useSelector((state) => state.user);
  const isDark = theme === "dark";

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosSecure.get(`/v1/companies/${slug}/`);
      setCompany(res.data);
    } catch (err) {
      console.error("Error fetching company profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchCompanyProfile();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0a0a0a]" : "bg-[#f8f9fa]"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ${isDark ? "text-white" : "text-black"}`}>Loading Company Profile...</span>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0a0a0a]" : "bg-[#f8f9fa]"}`}>
        <div className="text-center">
            <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-black"}`}>Company Not Found</h1>
            <button 
                onClick={() => navigate(-1)}
                className="mt-4 flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase"
            >
                <FaArrowLeft /> Go Back
            </button>
        </div>
      </div>
    );
  }

  const text = isDark ? "text-white" : "text-black";
  const bgCard = isDark ? "bg-neutral-900" : "bg-white";

  return (
    <div className={`min-h-screen px-4 py-8 md:px-8 ${isDark ? "bg-[#0a0a0a]" : "bg-[#f8f9fa]"}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <div className="mb-6">
            <button 
                onClick={() => navigate(-1)}
                className={`flex items-center gap-2 group transition-all ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-black"}`}
            >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all ${isDark ? "border-white/10 group-hover:bg-white/5" : "border-black/5 group-hover:bg-black/5"}`}>
                    <FaArrowLeft size={12} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN COLUMN (LEFT) */}
          <div className="lg:col-span-8">
            <div className={`overflow-hidden rounded-3xl shadow-xl ${bgCard} shadow-black/10 transition-all border ${isDark ? 'border-white/5' : 'border-black/5'}`}>
              {/* Cover Image Header */}
              <div className="h-40 md:h-48 bg-neutral-200 dark:bg-neutral-800 relative">
                {company.cover_image ? (
                  <img src={resolveMedia(company.cover_image)} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-red-600/20 to-orange-600/20 flex items-center justify-center">
                      <FaBuilding size={48} className="text-red-500/20" />
                    </div>
                )}
              </div>

              {/* Profile Info Section */}
              <div className="px-6 md:px-8 pb-8 relative">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  
                  {/* Logo */}
                  <div className="-mt-10 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-neutral-900 bg-white dark:bg-neutral-800 flex-shrink-0 shadow-xl relative z-10">
                    {company.logo ? (
                      <img src={resolveMedia(company.logo)} alt="Logo" className="w-full h-full object-cover bg-white" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                        <FaBuilding size={40} className="text-neutral-400" />
                      </div>
                    )}
                  </div>

                  {/* Header Details */}
                  <div className="flex-1 mt-4 w-full">
                    <h1 className={`text-3xl md:text-4xl font-black tracking-tighter mb-2 ${text}`}>
                      {company.name}
                    </h1>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {company.industry && (
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                          <FaBriefcase size={12} />
                          {company.industry}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* TABS NAVIGATION */}
                <div className={`flex justify-center mt-8 mb-6 py-3 border-b border-black/5 dark:border-white/5`}>
                  <div className={`inline-flex p-1 rounded-xl shadow-inner ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    {['about', 'posts'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                          : isDark ? "text-neutral-500 hover:text-white" : "text-neutral-500 hover:text-black"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAB CONTENT */}
                <div className="animate-fadeIn min-h-[300px]">
                  {activeTab === "about" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-6">
                        <div>
                          <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                            About Company
                          </h3>
                          <div className={`prose max-w-none text-sm leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                            {company.description ? (
                              <p className="whitespace-pre-line">{company.description}</p>
                            ) : (
                              <p className="italic opacity-50">No description provided yet.</p>
                            )}
                          </div>
                        </div>

                        {/* Contact Info */}
                        {(company.location || company.website) && (
                          <div className={`rounded-2xl border p-4 space-y-3 ${isDark ? "border-white/5 bg-neutral-900/50" : "border-black/5 bg-neutral-50/50"}`}>
                            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                              Contact Info
                            </h3>
                            {company.location && (
                              <div className="flex items-center gap-2.5">
                                <FaMapMarkerAlt size={12} className={isDark ? "text-red-400" : "text-red-500"} />
                                <span className={`text-xs ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>{company.location}</span>
                              </div>
                            )}
                            {company.website && (
                              <div className="flex items-center gap-2.5">
                                <FaGlobe size={12} className={isDark ? "text-blue-400" : "text-blue-500"} />
                                <a
                                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs truncate hover:underline ${isDark ? "text-blue-400" : "text-blue-600"}`}
                                >
                                  {company.website.replace(/^https?:\/\//, "")}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-1">
                        <CompanyMembers 
                          companyId={company.id} 
                          isDark={isDark} 
                          isOwner={false} // Always false on public profile
                          text={text} 
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "posts" && (
                    <div className="mt-2">
                      <CompanyPosts companyId={company.id} isDark={isDark} showCreate={false} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR COLUMN (RIGHT) - Optional stats or similar companies */}
          <div className="lg:col-span-4 space-y-6">
             <div className={`p-6 rounded-3xl border overflow-hidden relative ${isDark ? 'bg-gradient-to-br from-red-600/20 to-orange-600/20 border-white/5' : 'bg-gradient-to-br from-red-50 to-orange-50 border-black/5'}`}>
                 <div className="relative z-10">
                     <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? "text-red-400" : "text-red-600"}`}>Company Information</h3>
                     <p className={`text-sm font-bold opacity-60 uppercase tracking-widest ${text}`}>Status: {company.status || "Verified"}</p>
                     <p className={`text-[10px] opacity-40 mt-1 uppercase font-black ${text}`}>Founded: {new Date(company.created_at).getFullYear()}</p>
                 </div>
                 <FaBuilding size={80} className="absolute -right-4 -bottom-4 opacity-10 -rotate-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
