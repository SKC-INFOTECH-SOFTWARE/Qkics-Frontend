import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useThemeClasses from "../../utils/useThemeClasses";
import { useSelector } from "react-redux";
import { resolveProfileRoute } from "../../utils/getUserProfileRoute";


export default function ExpertModal({
  expert,
  onClose,
  resolveProfileImage,
  isDark,
}) {
  const [activeSection, setActiveSection] = useState("profile");

  const navigate = useNavigate();
  const loggedUser = useSelector((state) => state.user.data);

  // ✅ Use shared utility — no duplicate navigation logic
  const goToProfile = () => {
    onClose();
    navigate(resolveProfileRoute(expert.user, loggedUser));
  };



  const { bg, card, border } = useThemeClasses(isDark);

  if (!expert) return null;

  const toggle = (section) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  const handleBookSession = () => {
    onClose();
    navigate(`/book-session/${expert.user.uuid}`);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
    >
      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-xl border ${bg} ${border}`}
      >
        {/* HEADER */}
        <div className={`flex gap-3 md:gap-5 px-4 md:px-6 py-3 md:py-4 border-b ${border}`}>
          <img
              loading="lazy"
            src={resolveProfileImage(expert)}
            alt="profile"
            className="h-24 w-24 rounded-full object-cover cursor-pointer"
            onClick={goToProfile}
          />


          <div>
            <h2
              className="text-xl font-semibold cursor-pointer hover:underline"
              onClick={goToProfile}
            >
              {expert.first_name} {expert.last_name}
            </h2>


            <p className="text-sm opacity-70">{expert.headline}</p>

            <p className="mt-1 font-medium">
              ₹{expert.hourly_rate} / hour
            </p>

            <span
              className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${expert.is_available
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
                }`}
            >
              {expert.is_available ? "Available" : "Not Available"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="ml-auto text-xl opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3">
          {/* PROFILE */}
          <Section
            title="Profile"
            open={activeSection === "profile"}
            onClick={() => toggle("profile")}
            card={card}
            border={border}
          >
            {/* <Info label="Username" value={expert.user?.username} /> */}
            <Info label="Primary Expertise" value={expert.primary_expertise} />

            {expert.other_expertise && (
              <Info label="Other Expertise" value={expert.other_expertise} />
            )}

            {/* <Info label="Hourly Rate" value={`₹${expert.hourly_rate}`} />
            <Info
              label="Availability"
              value={expert.is_available ? "Available" : "Not Available"}
            />
            <Info
              label="Verified by Admin"
              value={expert.verified_by_admin ? "Yes" : "No"}
            /> */}
            {/* <Info
              label="Application Status"
              value={expert.application_status}
            />

            {expert.admin_review_note && (
              <Info
                label="Admin Review Note"
                value={expert.admin_review_note}
              />
            )} */}
          </Section>

          {/* EXPERIENCE */}
          <Section
            title="Experience"
            open={activeSection === "experience"}
            onClick={() => toggle("experience")}
            card={card}
            border={border}
          >
            {expert.experiences?.length ? (
              expert.experiences.map((exp) => (
                <div key={exp.id} className="mb-4">
                  <p className="font-medium">
                    {exp.job_title} — {exp.company}
                  </p>
                  <p className="text-xs opacity-70">
                    {exp.employment_type} • {exp.location}
                  </p>
                  <p className="text-xs opacity-70">
                    {exp.start_date} → {exp.end_date || "Present"}
                  </p>
                  {exp.description && (
                    <p className="text-sm mt-1 opacity-80">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm opacity-60">No experience added</p>
            )}
          </Section>

          {/* EDUCATION */}
          <Section
            title="Education"
            open={activeSection === "education"}
            onClick={() => toggle("education")}
            card={card}
            border={border}
          >
            {expert.educations?.length ? (
              expert.educations.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <p className="font-medium">
                    {edu.degree} in {edu.field_of_study}
                  </p>
                  <p className="text-xs opacity-70">{edu.school}</p>
                  <p className="text-xs opacity-70">
                    {edu.start_year} → {edu.end_year || "Present"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm opacity-60">No education details</p>
            )}
          </Section>

          {/* CERTIFICATIONS */}
          <Section
            title="Certifications"
            open={activeSection === "certifications"}
            onClick={() => toggle("certifications")}
            card={card}
            border={border}
          >
            {expert.certifications?.length ? (
              expert.certifications.map((cert) => (
                <div key={cert.id} className="mb-4">
                  <p className="font-medium">{cert.name}</p>
                  <p className="text-xs opacity-70">
                    {cert.issuing_organization}
                  </p>
                  <p className="text-xs opacity-70">
                    Issued: {cert.issue_date}
                    {cert.expiration_date &&
                      ` • Expires: ${cert.expiration_date}`}
                  </p>

                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 underline"
                    >
                      View Credential
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm opacity-60">No certifications</p>
            )}
          </Section>

          {/* HONORS */}
          <Section
            title="Honors & Awards"
            open={activeSection === "honors"}
            onClick={() => toggle("honors")}
            card={card}
            border={border}
          >
            {expert.honors_awards?.length ? (
              expert.honors_awards.map((honor) => (
                <div key={honor.id} className="mb-3">
                  <p className="font-medium">{honor.title}</p>
                  <p className="text-xs opacity-70">
                    {honor.issuer} • {honor.issue_date}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm opacity-60">No honors or awards</p>
            )}
          </Section>
        </div>




        {/* FOOTER */}
        <div className={`px-6 py-4 border-t ${border}`}>
          <button
            onClick={goToProfile}
            className="w-full mb-2 border border-red-500 text-red-700 py-2 rounded hover:bg-red-500 hover:text-white transition"
          >
            View Profile
          </button>
          <button
            onClick={handleBookSession}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Book Session
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* REUSABLE COMPONENTS                */
/* ---------------------------------- */

function Section({ title, open, onClick, children, card, border }) {
  return (
    <div className={`rounded-lg border ${border} ${card}`}>
      <button
        onClick={onClick}
        className="w-full text-left px-4 py-3 font-medium flex justify-between items-center"
      >
        {title}
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 text-sm space-y-2 opacity-90">
          {children}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <p>
      <span className="font-medium">{label}:</span> {value}
    </p>
  );
}