import React, { useState, useEffect } from "react";
import {
  Building2,
  X,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Shield,
  Layers,
  MapPin,
  Calendar,
  Sparkles
} from "lucide-react";
import {
  createCompany,
  updateCompany,
  deleteCompany,
  importTanneryData,
  exportTanneryData
} from "../services/firebase";

export default function CompanyModal({
  isOpen,
  onClose,
  companies,
  selectedCompanyId,
  onCompanyCreated,
  onCompanyUpdated,
  onCompanyDeleted,
  mode = "manage", // 'create', 'edit', 'manage', 'import'
  editingCompany = null
}) {
  const [activeTab, setActiveTab] = useState(mode === "create" ? "create" : (mode === "import" ? "import" : "list"));
  const [companyToEdit, setCompanyToEdit] = useState(editingCompany);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [certifications, setCertifications] = useState("LWG Gold Rated, ISO 14001:2015");
  const [dailyCapacityHides, setDailyCapacityHides] = useState(2000);
  const [establishedYear, setEstablishedYear] = useState(2010);
  const [statusMessage, setStatusMessage] = useState(null);

  // Import state
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState(null);

  // Populate when editing
  useEffect(() => {
    if (mode === "create") {
      setActiveTab("create");
      resetForm();
    } else if (mode === "edit" && editingCompany) {
      setActiveTab("edit");
      setCompanyToEdit(editingCompany);
      populateForm(editingCompany);
    } else if (mode === "import") {
      setActiveTab("import");
    } else {
      setActiveTab("list");
    }
  }, [mode, editingCompany, isOpen]);

  const resetForm = () => {
    setName("");
    setCode("");
    setLocation("");
    setCertifications("LWG Gold, ISO 14001:2015");
    setDailyCapacityHides(2000);
    setEstablishedYear(2018);
    setCompanyToEdit(null);
    setStatusMessage(null);
  };

  const populateForm = (comp) => {
    setName(comp.name || "");
    setCode(comp.code || "");
    setLocation(comp.location || "");
    setCertifications(Array.isArray(comp.certifications) ? comp.certifications.join(", ") : (comp.certifications || ""));
    setDailyCapacityHides(comp.dailyCapacityHides || 2000);
    setEstablishedYear(comp.establishedYear || 2018);
  };

  const handleStartEdit = (comp) => {
    setCompanyToEdit(comp);
    populateForm(comp);
    setActiveTab("edit");
    setStatusMessage(null);
  };

  const handleSubmitCompany = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage({ type: "error", text: "Company name is required." });
      return;
    }

    const payload = {
      name: name.trim(),
      code: (code.trim() || name.trim().slice(0, 3)).toUpperCase(),
      location: location.trim() || "Industrial Tannery Zone",
      certifications: certifications.split(",").map(c => c.trim()).filter(Boolean),
      dailyCapacityHides: Number(dailyCapacityHides) || 1000,
      establishedYear: Number(establishedYear) || new Date().getFullYear(),
    };

    try {
      if (activeTab === "edit" && companyToEdit) {
        const updated = await updateCompany(companyToEdit.id, payload);
        setStatusMessage({ type: "success", text: `Company "${updated.name}" updated successfully.` });
        if (onCompanyUpdated) onCompanyUpdated(updated);
        setTimeout(() => {
          setActiveTab("list");
        }, 800);
      } else {
        const created = await createCompany(payload);
        setStatusMessage({ type: "success", text: `Company "${created.name}" created successfully!` });
        if (onCompanyCreated) onCompanyCreated(created);
        setTimeout(() => {
          resetForm();
          setActiveTab("list");
        }, 800);
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Error saving company: " + err.message });
    }
  };

  const handleDelete = async (comp, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete company "${comp.name}" and all associated drums?`)) {
      await deleteCompany(comp.id);
      if (onCompanyDeleted) onCompanyDeleted(comp.id);
      setStatusMessage({ type: "success", text: `Company "${comp.name}" removed.` });
    }
  };

  // Import JSON File
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        setImportJsonText(content);
        setImportError(null);
      } catch (err) {
        setImportError("Failed to read file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    setImportError(null);
    try {
      if (!importJsonText.trim()) {
        setImportError("Please upload or paste JSON data.");
        return;
      }
      const parsed = JSON.parse(importJsonText);
      
      let companiesToImport = [];
      let drumsToImport = [];

      if (Array.isArray(parsed)) {
        // Assume array of companies
        companiesToImport = parsed;
      } else if (typeof parsed === "object" && parsed !== null) {
        if (Array.isArray(parsed.companies)) companiesToImport = parsed.companies;
        if (Array.isArray(parsed.drums)) drumsToImport = parsed.drums;
      }

      if (companiesToImport.length === 0 && drumsToImport.length === 0) {
        setImportError("No valid companies or drums found in JSON. Format must contain a 'companies' array.");
        return;
      }

      importTanneryData({ companies: companiesToImport, drums: drumsToImport });
      setStatusMessage({
        type: "success",
        text: `Successfully imported ${companiesToImport.length} companies and ${drumsToImport.length} drums!`
      });
      if (onCompanyCreated) onCompanyCreated(companiesToImport[0]);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (err) {
      setImportError("Invalid JSON syntax: " + err.message);
    }
  };

  // Download Sample JSON Template
  const handleDownloadSample = () => {
    const sample = {
      companies: [
        {
          id: "comp_custom_01",
          name: "Actual Tannery Name Ltd.",
          code: "ATN",
          location: "Industrial Area, City, Country",
          certifications: ["LWG Gold", "ISO 14001"],
          dailyCapacityHides: 2500,
          establishedYear: 2020
        }
      ],
      drums: [
        {
          id: "drum_custom_01",
          companyId: "comp_custom_01",
          drumNumber: "Drum #01",
          name: "Drum #01 (Liming & Soaking)",
          type: "African Iroko Hardwood Drum",
          capacityLiters: 10000,
          maxLoadKg: 3500,
          diameterMeters: 4.0,
          widthMeters: 3.5,
          maxRpm: 12
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DrumsOS_Tannery_Template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export current data
  const handleExportBackup = () => {
    const data = exportTanneryData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DrumsOS_Export_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.78)",
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
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          background: "#10182b",
          border: "1px solid var(--border-card)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)"
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
              <span className="badge badge-amber">Tannery Management</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {companies.length} Registered Companies
              </span>
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: "4px 0 2px 0" }}>
              Company & Tannery Setup
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
              Create, edit, or upload actual tannery company entities and their operational profiles.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "18px",
          background: "rgba(16, 24, 43, 0.8)",
          padding: "4px",
          borderRadius: "8px",
          border: "1px solid var(--border-subtle)"
        }}>
          <button
            onClick={() => setActiveTab("list")}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: activeTab === "list" ? "700" : "500",
              color: activeTab === "list" ? "#ffffff" : "var(--text-secondary)",
              background: activeTab === "list" ? "var(--bg-card)" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            All Companies ({companies.length})
          </button>

          <button
            onClick={() => {
              resetForm();
              setActiveTab("create");
            }}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: activeTab === "create" ? "700" : "500",
              color: activeTab === "create" ? "#ffffff" : "var(--text-secondary)",
              background: activeTab === "create" ? "var(--bg-card)" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <Plus size={14} color="var(--cyan-primary)" /> Create Company
          </button>

          <button
            onClick={() => setActiveTab("import")}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: activeTab === "import" ? "700" : "500",
              color: activeTab === "import" ? "#ffffff" : "var(--text-secondary)",
              background: activeTab === "import" ? "var(--bg-card)" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <Upload size={14} color="var(--leather-amber)" /> Upload / Import
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div style={{
            background: statusMessage.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
            border: `1px solid ${statusMessage.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "16px",
            fontSize: "0.82rem",
            color: statusMessage.type === "success" ? "#34d399" : "#fb7185",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: LIST COMPANIES */}
        {activeTab === "list" && (
          <div>
            {companies.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "36px 20px",
                background: "rgba(16, 24, 43, 0.6)",
                borderRadius: "12px",
                border: "1px dashed var(--border-card)"
              }}>
                <Building2 size={36} color="var(--text-muted)" style={{ margin: "0 auto 12px auto" }} />
                <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc", marginBottom: "4px" }}>
                  No Companies Configured
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  Add your first leather tannery or factory to start configuring drum operations.
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab("create");
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem", padding: "8px 18px" }}
                >
                  <Plus size={15} /> Create Company Now
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
                {companies.map((comp) => (
                  <div
                    key={comp.id}
                    style={{
                      background: "rgba(16, 24, 43, 0.7)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc" }}>
                          {comp.name}
                        </span>
                        <span className="badge badge-amber font-mono" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                          {comp.code}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Location:</span> {comp.location} • <span style={{ color: "var(--text-muted)" }}>Cap:</span> {comp.dailyCapacityHides} hides/day
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--cyan-primary)", marginTop: "2px" }}>
                        {Array.isArray(comp.certifications) ? comp.certifications.join(" • ") : comp.certifications}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => handleStartEdit(comp)}
                        className="btn btn-outline"
                        style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                        title="Edit Company Details"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(comp, e)}
                        className="btn btn-outline"
                        style={{ padding: "6px 10px", fontSize: "0.75rem", color: "var(--rose-danger)" }}
                        title="Delete Company"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Export Button */}
            {companies.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                <button
                  onClick={handleExportBackup}
                  className="btn btn-outline"
                  style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                >
                  <Download size={13} /> Backup Data (JSON)
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab("create");
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: "0.82rem", padding: "7px 16px" }}
                >
                  <Plus size={14} /> Add Another Company
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREATE / EDIT COMPANY FORM */}
        {(activeTab === "create" || activeTab === "edit") && (
          <form onSubmit={handleSubmitCompany}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Company / Tannery Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Milan Leather Works S.p.A."
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Prefix Code *</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>3-4 letters</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="form-input font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="MLN"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">Location / Tannery Zone Address</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Leather Technology Park, Santa Croce, Pisa, Italy"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div className="form-group">
                <label className="form-label">Daily Capacity (Hides / Day)</label>
                <input
                  type="number"
                  min="50"
                  max="100000"
                  step="50"
                  className="form-input font-mono"
                  value={dailyCapacityHides}
                  onChange={(e) => setDailyCapacityHides(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Established Year</label>
                <input
                  type="number"
                  min="1850"
                  max="2030"
                  className="form-input font-mono"
                  value={establishedYear}
                  onChange={(e) => setEstablishedYear(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">
                <span>Environmental & Quality Certifications</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Comma separated</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="LWG Gold, ISO 14001:2015, ZDHC Level 3, REACH"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="btn btn-secondary"
                style={{ fontSize: "0.82rem", padding: "8px 16px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: "0.85rem", padding: "8px 20px" }}
              >
                {activeTab === "edit" ? "Save Changes" : "Create Company"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: UPLOAD / IMPORT ACTUAL DATA */}
        {activeTab === "import" && (
          <div>
            <div style={{
              background: "rgba(6, 182, 212, 0.08)",
              border: "1px solid rgba(6, 182, 212, 0.25)",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "16px",
              fontSize: "0.8rem",
              color: "#e2e8f0"
            }}>
              <div style={{ fontWeight: "700", color: "var(--cyan-primary)", marginBottom: "4px" }}>
                Upload Your Actual Tannery Data
              </div>
              <div>
                You can upload a <code>.json</code> file or paste a JSON object containing your companies and drums.
                Download our template below to format your records accurately.
              </div>
              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="btn btn-outline"
                  style={{ fontSize: "0.75rem", padding: "5px 10px" }}
                >
                  <Download size={13} /> Download JSON Template
                </button>
              </div>
            </div>

            {/* File Input */}
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">Upload JSON File</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "#f8fafc",
                  fontSize: "0.85rem",
                  width: "100%"
                }}
              />
            </div>

            {/* Paste JSON Text Area */}
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Or Paste JSON Content Directly</label>
              <textarea
                rows="6"
                className="form-textarea font-mono"
                style={{ fontSize: "0.78rem" }}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{\n  "companies": [\n    {\n      "name": "My Actual Tannery",\n      "code": "MAT",\n      "location": "City, Country"\n    }\n  ]\n}'
              />
            </div>

            {importError && (
              <div style={{
                background: "rgba(244, 63, 94, 0.15)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "14px",
                fontSize: "0.78rem",
                color: "#fb7185"
              }}>
                {importError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="btn btn-secondary"
                style={{ fontSize: "0.82rem", padding: "8px 16px" }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="btn btn-leather"
                style={{ fontSize: "0.85rem", padding: "8px 20px" }}
              >
                <Upload size={14} /> Import & Apply Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
