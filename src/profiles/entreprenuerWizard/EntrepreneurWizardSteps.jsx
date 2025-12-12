// src/profiles/entrepreneurWizard/EntrepreneurWizardSteps.jsx
import React from "react";

export default function Steps(props) {
  const {
    step,
    setStep,
    next,
    prev,
    goTo,
    form,
    setForm,
    profileMeta,
    isEditable,
    isVerified,
    applicationStatus,
    loading,
    saving,
    submitting,
    card,
    handleSaveDraft,
    openSubmitModal,
    canSubmit,
  } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Left Nav */}
      <div className={`${card.includes("neutral-900") ? "text-white" : "text-black"} md:col-span-1`}>
        <nav className="space-y-2 sticky top-28">
          <NavItem title="Startup Basics" stepNum={1} active={step === 1} onClick={() => goTo(1)} />
          <NavItem title="Business Details" stepNum={2} active={step === 2} onClick={() => goTo(2)} />
          <NavItem title="Review & Submit" stepNum={3} active={step === 3} onClick={() => goTo(3)} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:col-span-3">
        {step === 1 && (
          <Step1
            form={form}
            setForm={setForm}
            isEditable={isEditable}
            saving={saving}
            next={next}
            handleSaveDraft={handleSaveDraft}
            card={card}
          />
        )}

        {step === 2 && (
          <Step2
            form={form}
            setForm={setForm}
            isEditable={isEditable}
            saving={saving}
            prev={prev}
            next={next}
            handleSaveDraft={handleSaveDraft}
            card={card}
          />
        )}

        {step === 3 && (
          <Step3
            form={form}
            isEditable={isEditable}
            submitting={submitting}
            prev={prev}
            openSubmitModal={openSubmitModal}
            handleSaveDraft={handleSaveDraft}
            card={card}
            applicationStatus={applicationStatus}
            isVerified={isVerified}
            canSubmit={canSubmit}
          />
        )}
      </div>
    </div>
  );
}

/* Left Nav Item */
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

/* Step 1 */
function Step1({ form, setForm, isEditable, saving, next, handleSaveDraft, card }) {
  return (
    <div className={`p-6 rounded-xl shadow mb-12 ${card}`}>
      <h2 className="text-xl font-semibold mb-4">Startup Basics</h2>

      <Field label="Startup Name" value={form.startup_name} onChange={(v) => setForm((p) => ({ ...p, startup_name: v }))} disabled={!isEditable} />
      <Field label="One Liner" value={form.one_liner} onChange={(v) => setForm((p) => ({ ...p, one_liner: v }))} disabled={!isEditable} />
      <Field label="Website" value={form.website} onChange={(v) => setForm((p) => ({ ...p, website: v }))} disabled={!isEditable} />
      <Textarea label="Description" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} disabled={!isEditable} />

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSaveDraft}
          disabled={saving || !isEditable}
          className={`px-4 py-2 rounded-md ${
            isEditable ? "bg-green-500 text-white" : "bg-neutral-600 text-white/80 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>

        <button onClick={next} className="px-4 py-2 rounded-md bg-blue-600 text-white">Next</button>
      </div>
    </div>
  );
}

/* Step 2 */
function Step2({ form, setForm, isEditable, saving, prev, next, handleSaveDraft, card }) {
  return (
    <div className={`p-6 rounded-xl shadow mb-12 min-h-[70vh] ${card}`}>
      <h2 className="text-xl font-semibold mb-4">Business Details</h2>

      <Field label="Industry" value={form.industry} onChange={(v) => setForm((p) => ({ ...p, industry: v }))} disabled={!isEditable} />
      <Field label="Location" value={form.location} onChange={(v) => setForm((p) => ({ ...p, location: v }))} disabled={!isEditable} />

      <label className="block mb-4">
        <div className="font-medium mb-1">Funding Stage</div>
        <select
          disabled={!isEditable}
          value={form.funding_stage}
          onChange={(e) => setForm((p) => ({ ...p, funding_stage: e.target.value }))}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Funding Stage</option>
          <option value="pre_seed">Pre-Seed</option>
          <option value="seed">Seed</option>
          <option value="series_a">Series A</option>
          <option value="series_b">Series B+</option>
          <option value="bootstrapped">Bootstrapped</option>
        </select>
      </label>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={prev} className="px-4 py-2 rounded-md border">Back</button>

        <button
          onClick={handleSaveDraft}
          disabled={saving || !isEditable}
          className={`px-4 py-2 rounded-md ${
            isEditable ? "bg-green-600 text-white" : "bg-neutral-600 text-white/80 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>

        <button onClick={next} className="px-4 py-2 rounded-md bg-blue-600 text-white">Next</button>
      </div>
    </div>
  );
}

/* Step 3 */
function Step3({ form, isEditable, submitting, prev, openSubmitModal, handleSaveDraft, card, applicationStatus, isVerified, canSubmit }) {
  return (
    <div className={`p-6 rounded-xl shadow mb-12 ${card}`}>
      <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>

      {isVerified && <div className="mb-3 text-green-600 font-semibold">✓ Verified Entrepreneur</div>}

      <div className="space-y-3">
        <Review label="Startup Name" value={form.startup_name} />
        <Review label="One Liner" value={form.one_liner} />
        <Review label="Website" value={form.website} />
        <Review label="Industry" value={form.industry} />
        <Review label="Location" value={form.location} />
        <Review label="Funding Stage" value={form.funding_stage} />
        <Review label="Description" value={form.description} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={prev} className="px-4 py-2 rounded-md border">Back</button>

        <button onClick={handleSaveDraft} className="px-4 py-2 bg-green-600 text-white rounded-md">
          Save Draft
        </button>

        <button
          onClick={openSubmitModal}
          disabled={!canSubmit || submitting}
          className={`px-4 py-2 rounded-md ${
            canSubmit ? "bg-blue-600 text-white" : "bg-gray-500 text-white cursor-not-allowed"
          }`}
        >
          {submitting
            ? "Submitting..."
            : applicationStatus === "approved"
            ? "Verified"
            : applicationStatus === "pending"
            ? "Pending Review"
            : "Submit for Review"}
        </button>
      </div>

      <p className="mt-4 text-sm opacity-70">
        After submission, admins will review your profile. While in review, editing is disabled for submission
        (but profile remains editable until admin responds).
      </p>
    </div>
  );
}

/* Reusable Fields */
function Field({ label, value, onChange, disabled }) {
  return (
    <label className="block mb-4">
      <div className="font-medium mb-1">{label}</div>
      <input
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
      />
    </label>
  );
}

function Textarea({ label, value, onChange, disabled }) {
  return (
    <label className="block mb-4">
      <div className="font-medium mb-1">{label}</div>
      <textarea
        disabled={disabled}
        rows={4}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
      />
    </label>
  );
}

function Review({ label, value }) {
  return (
    <p>
      <span className="font-semibold">{label}:</span> {value || "-"}
    </p>
  );
}
