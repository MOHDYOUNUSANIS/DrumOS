import React, { useState } from "react";
import {
  Database,
  X,
  Check,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Copy
} from "lucide-react";
import {
  getFirebaseConfig,
  saveFirebaseCredentials,
  resetFirebaseToSandbox,
  resetTanneryDataToDefaults,
  isCustomFirebaseConfigured
} from "../services/firebase";

export default function FirebaseConfigModal({ isOpen, onClose, onConfigUpdated }) {
  if (!isOpen) return null;

  const currentConfig = getFirebaseConfig();
  const isCustom = isCustomFirebaseConfigured();

  const [formData, setFormData] = useState({
    apiKey: currentConfig.apiKey || "",
    authDomain: currentConfig.authDomain || "",
    projectId: currentConfig.projectId || "",
    storageBucket: currentConfig.storageBucket || "",
    messagingSenderId: currentConfig.messagingSenderId || "",
    appId: currentConfig.appId || ""
  });

  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = saveFirebaseCredentials(formData);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: res.success,
        message: res.success
          ? "Firebase credentials saved! Drum processing records will sync with Cloud Firestore."
          : `Configuration saved with local sync fallback: ${res.error || "Ready"}`
      });
      if (onConfigUpdated) onConfigUpdated();
    }, 600);
  };

  const handleResetToSandbox = () => {
    if (window.confirm("Reset connection to DrumsOS Local Sandbox Database?")) {
      resetFirebaseToSandbox();
      setFormData(getFirebaseConfig());
      setTestResult({ success: true, message: "Restored default Sandbox mode." });
      if (onConfigUpdated) onConfigUpdated();
    }
  };

  const handleResetData = () => {
    if (window.confirm("Reset all tannery activity history, drum states, and inventory back to factory initial presets?")) {
      resetTanneryDataToDefaults();
      alert("Tannery operational data reset to defaults.");
      window.location.reload();
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }} onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          background: "#10182b",
          border: "1px solid var(--border-card)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--border-subtle)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`badge ${isCustom ? "badge-emerald" : "badge-cyan"}`}>
                {isCustom ? "Cloud Firestore Live" : "Sandbox Database Mode"}
              </span>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: "4px 0 2px 0" }}>
              Firebase Database Integration
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
              Connect your production Google Cloud Firebase Firestore project or operate using the offline-first sync engine.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Message */}
        {testResult && (
          <div style={{
            background: testResult.success ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
            border: `1px solid ${testResult.success ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px",
            fontSize: "0.82rem",
            color: testResult.success ? "#34d399" : "#fb7185",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSaveConfig}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div className="form-group">
              <label className="form-label">Firebase Project ID</label>
              <input
                type="text"
                required
                className="form-input font-mono"
                value={formData.projectId}
                onChange={(e) => handleInputChange("projectId", e.target.value)}
                placeholder="drumsos-tannery-suite"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Web API Key</label>
              <input
                type="text"
                required
                className="form-input font-mono"
                value={formData.apiKey}
                onChange={(e) => handleInputChange("apiKey", e.target.value)}
                placeholder="AIzaSy..."
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div className="form-group">
              <label className="form-label">Auth Domain</label>
              <input
                type="text"
                className="form-input font-mono"
                value={formData.authDomain}
                onChange={(e) => handleInputChange("authDomain", e.target.value)}
                placeholder="project.firebaseapp.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Storage Bucket</label>
              <input
                type="text"
                className="form-input font-mono"
                value={formData.storageBucket}
                onChange={(e) => handleInputChange("storageBucket", e.target.value)}
                placeholder="project.appspot.com"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div className="form-group">
              <label className="form-label">Messaging Sender ID</label>
              <input
                type="text"
                className="form-input font-mono"
                value={formData.messagingSenderId}
                onChange={(e) => handleInputChange("messagingSenderId", e.target.value)}
                placeholder="982736412..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">App ID</label>
              <input
                type="text"
                className="form-input font-mono"
                value={formData.appId}
                onChange={(e) => handleInputChange("appId", e.target.value)}
                placeholder="1:982736412:web:..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={handleResetToSandbox}
                className="btn btn-secondary"
                style={{ fontSize: "0.78rem", padding: "8px 12px" }}
                title="Switch back to Sandbox"
              >
                <RotateCcw size={13} /> Use Sandbox
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="btn btn-outline"
                style={{ fontSize: "0.78rem", padding: "8px 12px", color: "var(--leather-amber)" }}
                title="Reset sample tannery activities"
              >
                Reset Demo Data
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ fontSize: "0.82rem", padding: "8px 16px" }}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isTesting}
                className="btn btn-primary"
                style={{ fontSize: "0.82rem", padding: "8px 18px" }}
              >
                {isTesting ? "Validating..." : "Save & Sync"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
