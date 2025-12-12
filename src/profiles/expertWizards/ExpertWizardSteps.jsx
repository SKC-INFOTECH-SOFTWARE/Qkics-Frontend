// src/profiles/expert/ExpertWizardSteps.jsx
import React from "react";

/**
 * Steps Component
 * Receives everything from ExpertWizard.jsx
 */

export default function Steps(props) {
  const {
    step,
    setStep,
    next,
    prev,
    goTo,

    profile,
    setProfile,
    profileMeta,
    isEditable,
    isVerified,
    applicationStatus,

    experiences,
    educations,
    certifications,
    honors,

    handleSaveProfile,
    setShowAddModal,
    setShowSubmitNoteModal,

    saving,
    submitting,

    isDark,
  } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* LEFT SIDEBAR */}
      <div className={`${isDark ? "text-white" : "text-black"} md:col-span-1`}>
        <nav className="space-y-2 sticky top-28">
          <NavItem title="Basic Profile" stepNum={1} active={step === 1} onClick={() => goTo(1)} />
          <NavItem title="Credentials" stepNum={2} active={step === 2} onClick={() => goTo(2)} />
          <NavItem title="Review & Submit" stepNum={3} active={step === 3} onClick={() => goTo(3)} />
        </nav>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="md:col-span-3">
        {step === 1 && (
          <Step1
            profile={profile}
            setProfile={setProfile}
            isEditable={isEditable}
            isDark={isDark}
            saving={saving}
            next={next}
            handleSaveProfile={handleSaveProfile}
          />
        )}

        {step === 2 && (
          <Step2
            isDark={isDark}
            experiences={experiences}
            educations={educations}
            certifications={certifications}
            honors={honors}
            isEditable={isEditable}
            prev={prev}
            next={next}
            setShowAddModal={setShowAddModal}
          />
        )}

        {step === 3 && (
          <Step3
            profile={profile}
            experiences={experiences}
            educations={educations}
            certifications={certifications}
            honors={honors}
            isEditable={isEditable}
            isDark={isDark}
            saving={saving}
            submitting={submitting}
            prev={prev}
            handleSaveProfile={handleSaveProfile}
            setShowSubmitNoteModal={setShowSubmitNoteModal}
            applicationStatus={applicationStatus}
            isVerified={isVerified}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------
   NAV ITEM
---------------------------------------------- */
function NavItem({ title, stepNum, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-md ${
        active ? "bg-blue-600 text-white" : "border"
      }`}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-xs opacity-70">Step {stepNum}</div>
    </button>
  );
}

/* ----------------------------------------------
   STEP 1 — BASIC PROFILE
---------------------------------------------- */
function Step1({ profile, setProfile, isEditable, isDark, saving, next, handleSaveProfile }) {
  return (
    <div className={`p-6 rounded-xl shadow mb-6 min-h-[70vh] ${isDark ? "bg-neutral-900" : "bg-white"}`}>
      <h2 className="text-xl font-semibold mb-4">Basic Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First Name" value={profile.first_name} disabled={!isEditable}
          onChange={(v) => setProfile((p) => ({ ...p, first_name: v }))} />

        <Input label="Last Name" value={profile.last_name} disabled={!isEditable}
          onChange={(v) => setProfile((p) => ({ ...p, last_name: v }))} />

        <Input label="Headline" value={profile.headline} disabled={!isEditable}
          placeholder="e.g. PHD IN DEEP LEARNING"
          onChange={(v) => setProfile((p) => ({ ...p, headline: v }))} />

        <Input label="Primary Expertise" value={profile.primary_expertise} disabled={!isEditable}
          placeholder="e.g. Deep Learning"
          onChange={(v) => setProfile((p) => ({ ...p, primary_expertise: v }))} />

        <Input label="Other Expertise" value={profile.other_expertise} disabled={!isEditable}
          onChange={(v) => setProfile((p) => ({ ...p, other_expertise: v }))} />

        <Input label="Hourly Rate (INR)" type="number" value={profile.hourly_rate} disabled={!isEditable}
          onChange={(v) => setProfile((p) => ({ ...p, hourly_rate: Number(v) }))} />

        {/* Availability */}
        <div className="md:col-span-2">
          <label className="text-sm opacity-80 block mb-1">Availability</label>
          <label className={`px-3 py-1 rounded-md border ${profile.is_available ? "bg-green-50" : ""}`}>
            <input
              type="checkbox"
              checked={profile.is_available}
              disabled={!isEditable}
              onChange={(e) => setProfile((p) => ({ ...p, is_available: e.target.checked }))}
            />{" "}
            <span className="ml-2 text-sm">Available for hire</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSaveProfile}
          disabled={saving || !isEditable}
          className={`px-4 py-2 rounded-md font-semibold ${
            isEditable ? "bg-green-500 text-white" : "bg-neutral-600 text-white/80 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>

        <button onClick={next} className="px-4 py-2 rounded-md  bg-blue-600 text-white">
          Next
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------
   STEP 2 — CREDENTIALS (SCROLL FIXED)
---------------------------------------------- */
function Step2({
  isDark,
  experiences,
  educations,
  certifications,
  honors,
  isEditable,
  saving,
  handleSaveProfile,
  prev,
  next,
  setShowAddModal,
}) {
  return (
    <div
      className={`p-6 rounded-xl shadow mb-6 min-h-[75vh] ${
        isDark ? "bg-neutral-900" : "bg-white"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Credentials</h2>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CredentialCard
          title="Experience"
          items={experiences}
          onAdd={() => isEditable && setShowAddModal("experience")}
          renderItem={(it) => (
            <div>
              <div className="font-semibold">
                {it.job_title} @ {it.company}
              </div>
              <div className="text-sm opacity-70">
                {it.start_date} — {it.end_date || "Present"}
              </div>
            </div>
          )}
        />

        <CredentialCard
          title="Education"
          items={educations}
          onAdd={() => isEditable && setShowAddModal("education")}
          renderItem={(it) => (
            <div>
              <div className="font-semibold">
                {it.school} — {it.degree}
              </div>
              <div className="text-sm opacity-70">
                {it.start_year} — {it.end_year}
              </div>
            </div>
          )}
        />

        <CredentialCard
          title="Certifications"
          items={certifications}
          onAdd={() => isEditable && setShowAddModal("cert")}
          renderItem={(it) => (
            <div>
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm opacity-70">
                {it.issuing_organization} • {it.issue_date}
              </div>
            </div>
          )}
        />

        <CredentialCard
          title="Honors & Awards"
          items={honors}
          onAdd={() => isEditable && setShowAddModal("honor")}
          renderItem={(it) => (
            <div>
              <div className="font-semibold">{it.title}</div>
              <div className="text-sm opacity-70">
                {it.issuer} • {it.issue_date}
              </div>
            </div>
          )}
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <button onClick={prev} className="px-4 py-2 rounded-md border">
          Back
        </button>
        <button
          onClick={handleSaveProfile}
          disabled={saving || !isEditable}
          className={`px-4 py-2 rounded-md ${
            isEditable ? "bg-green-500 text-white" : "bg-neutral-600 text-white/60 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>

        <button onClick={next} className="px-4 py-2 rounded-md bg-blue-600 text-white">
          Next
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------
   STEP 3 — REVIEW & SUBMIT
---------------------------------------------- */
function Step3({
  profile,
  experiences,
  educations,
  certifications,
  honors,
  isEditable,
  isDark,
  saving,
  submitting,
  prev,
  handleSaveProfile,
  setShowSubmitNoteModal,
  applicationStatus,
  isVerified,
}) {
  /* Submit button logic — OPTION A */
  const submitDisabled =
    submitting || applicationStatus === "pending" || applicationStatus === "approved";

  return (
    <div className={`p-6 rounded-xl shadow mb-6 min-h-[70vh] ${isDark ? "bg-neutral-900" : "bg-white"}`}>
      <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>

      {isVerified && <div className="mb-2 text-green-500 font-semibold">✓ Verified Expert</div>}

      <div className="space-y-4">
        <ReviewRow label="Name" value={`${profile.first_name} ${profile.last_name}`} />
        <ReviewRow label="Headline" value={profile.headline} />
        <ReviewRow label="Primary Expertise" value={profile.primary_expertise} />
        <ReviewRow label="Hourly Rate" value={`₹ ${profile.hourly_rate}`} />

        <ReviewList label="Experience" items={experiences} emptyText="No experiences added" />
        <ReviewList label="Education" items={educations} emptyText="No education added" />
        <ReviewList label="Certifications" items={certifications} emptyText="No certifications added" />
        <ReviewList label="Honors & Awards" items={honors} emptyText="No honors added" />
      </div>

      {/* Bottom Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <button onClick={prev} className="px-4 py-2 rounded-md border">
          Back
        </button>

        {/* Save Draft */}
        <button
          onClick={handleSaveProfile}
          disabled={saving || !isEditable}
          className={`px-4 py-2 rounded-md ${
            isEditable ? "bg-green-500 text-white" : "bg-neutral-600 text-white/60 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>

        {/* Submit for Review */}
        <button
          onClick={() => setShowSubmitNoteModal(true)}
          disabled={submitDisabled}
          className={`px-4 py-2 rounded-md ${
            applicationStatus === "approved"
              ? "bg-green-600 text-white cursor-not-allowed"
              : applicationStatus === "pending"
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "bg-blue-600 text-white"
          }`}
        >
          {applicationStatus === "approved"
            ? "Verified"
            : applicationStatus === "pending"
            ? "Pending Review"
            : submitting
            ? "Submitting..."
            : "Submit for Review"}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------
   SMALL COMPONENTS
---------------------------------------------- */
function Input({ label, value, onChange, type = "text", placeholder = "", disabled = false }) {
  return (
    <div>
      <label className="text-sm opacity-80">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full mt-1 px-3 py-2 rounded border ${
          disabled ? "bg-neutral-100/50 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}

function CredentialCard({ title, items, onAdd, renderItem }) {
  return (
    <div className="p-4 rounded-xl border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <button onClick={onAdd} className="text-sm px-3 py-1 rounded-md border">
          Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-sm opacity-70">No {title.toLowerCase()} added.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="p-3 rounded-md bg-white/5 border">
              {renderItem(it)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-40 text-sm opacity-70">{label}</div>
      <div className="flex-1">{value || "-"}</div>
    </div>
  );
}

function ReviewList({ label, items, emptyText }) {
  return (
    <div>
      <div className="w-full text-sm opacity-70 mb-2">{label}</div>
      {items.length === 0 ? (
        <div className="text-sm opacity-70">{emptyText}</div>
      ) : (
        <ul className="list-disc pl-6">
          {items.map((it) => (
            <li key={it.id} className="text-sm">
              {Object.values(it).slice(0, 2).join(" • ")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
