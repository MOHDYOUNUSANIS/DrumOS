import React from "react";
import {
  Building2,
  Disc3,
  Layers,
  Scale,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  Plus,
  Edit2,
  Upload,
  AlertCircle
} from "lucide-react";
import { LEATHER_TYPES } from "../data/tanneryData";

export default function HierarchicalSelector({
  companies,
  selectedCompanyId,
  onSelectCompany,
  drums,
  selectedDrumId,
  onSelectDrum,
  selectedLeatherId,
  onSelectLeather,
  batchWeightKg,
  onChangeBatchWeight,
  lotNumber,
  onChangeLotNumber,
  onOpenCompanyModal,
  onOpenDrumModal
}) {
  const activeCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0] || null;
  const companyDrums = activeCompany ? drums.filter((d) => d.companyId === activeCompany.id) : [];
  const activeDrum = companyDrums.find((d) => d.id === selectedDrumId) || companyDrums[0] || null;
  const activeLeather = LEATHER_TYPES.find((l) => l.id === selectedLeatherId) || LEATHER_TYPES[0];

  // If no companies exist, render Onboarding Card
  if (companies.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: "32px 24px", marginBottom: "24px", textAlign: "center" }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "rgba(217, 119, 6, 0.15)",
          border: "1px solid rgba(217, 119, 6, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px auto"
        }}>
          <Building2 size={28} color="var(--leather-amber)" />
        </div>

        <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc", marginBottom: "8px" }}>
          Welcome to DrumsOS — Ready for Actual Tannery Setup
        </h3>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", maxWidth: "580px", margin: "0 auto 20px auto", lineHeight: 1.5 }}>
          All test mock values have been cleared. To begin drum-wise leather processing, create your company or upload your actual data.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => onOpenCompanyModal("create")}
            className="btn btn-primary"
            style={{ fontSize: "0.9rem", padding: "10px 22px" }}
          >
            <Plus size={16} /> Create Your Company
          </button>
          <button
            onClick={() => onOpenCompanyModal("import")}
            className="btn btn-leather"
            style={{ fontSize: "0.9rem", padding: "10px 20px" }}
          >
            <Upload size={16} /> Upload Company Data (JSON)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: "20px", marginBottom: "24px" }}>
      {/* Title & Hierarchy Stepper Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "18px",
        paddingBottom: "14px",
        borderBottom: "1px solid var(--border-subtle)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "rgba(6, 182, 212, 0.2)",
              color: "var(--cyan-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "700"
            }}>
              1
            </span>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0, color: "#ffffff" }}>
              Hierarchical Tannery Selection & Batch Parameters
            </h2>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px", margin: 0 }}>
            Select company, drum number, and leather grade to automatically load formulation recipes and chemical dosage.
          </p>
        </div>

        {/* Breadcrumb path preview */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(16, 24, 43, 0.8)",
          padding: "6px 14px",
          borderRadius: "8px",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.78rem",
          fontFamily: "var(--font-mono)",
        }}>
          <span style={{ color: "var(--leather-amber)", fontWeight: "600" }}>{activeCompany?.code || "COMP"}</span>
          <ChevronRight size={12} color="var(--text-dim)" />
          <span style={{ color: "var(--cyan-primary)", fontWeight: "600" }}>{activeDrum?.drumNumber || "No Drum"}</span>
          <ChevronRight size={12} color="var(--text-dim)" />
          <span style={{ color: "#34d399", fontWeight: "600" }}>{activeLeather?.name.split(" ")[0]}</span>
        </div>
      </div>

      {/* 3 Tier Hierarchical Dropdown Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px",
      }}>
        {/* Step 1: Select Company */}
        <div style={{
          background: "rgba(16, 24, 43, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <label className="form-label" style={{ margin: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 size={15} color="var(--leather-amber)" />
                1. Tannery Company
              </span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={() => onOpenCompanyModal("edit", activeCompany)}
                className="btn btn-outline"
                style={{ padding: "2px 6px", fontSize: "0.68rem" }}
                title="Edit Selected Company"
              >
                <Edit2 size={11} /> Edit
              </button>
              <button
                type="button"
                onClick={() => onOpenCompanyModal("create")}
                className="btn btn-outline"
                style={{ padding: "2px 6px", fontSize: "0.68rem", color: "var(--cyan-primary)" }}
                title="Create New Company"
              >
                <Plus size={11} /> New
              </button>
            </div>
          </div>

          <select
            className="form-select"
            value={selectedCompanyId || activeCompany?.id || ""}
            onChange={(e) => onSelectCompany(e.target.value)}
            style={{ fontWeight: "600", fontSize: "0.92rem" }}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} ({company.code})
              </option>
            ))}
          </select>

          <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
              <span>Location:</span>
              <span style={{ color: "#f8fafc", fontWeight: "500" }}>{activeCompany?.location || "N/A"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Capacity:</span>
              <span style={{ color: "var(--cyan-primary)", fontWeight: "500" }}>
                {activeCompany?.dailyCapacityHides || 0} hides/day
              </span>
            </div>
          </div>
        </div>

        {/* Step 2: Select Drum Number */}
        <div style={{
          background: "rgba(16, 24, 43, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <label className="form-label" style={{ margin: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Disc3 size={15} color="var(--cyan-primary)" />
                2. Drum Number
              </span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {activeDrum && (
                <button
                  type="button"
                  onClick={() => onOpenDrumModal(activeDrum)}
                  className="btn btn-outline"
                  style={{ padding: "2px 6px", fontSize: "0.68rem" }}
                  title="Edit Drum"
                >
                  <Edit2 size={11} /> Edit
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenDrumModal(null)}
                className="btn btn-outline"
                style={{ padding: "2px 6px", fontSize: "0.68rem", color: "var(--cyan-primary)" }}
                title="Add Drum to Company"
              >
                <Plus size={11} /> Add Drum
              </button>
            </div>
          </div>

          {companyDrums.length === 0 ? (
            <div style={{
              background: "rgba(12, 18, 34, 0.8)",
              border: "1px dashed var(--border-card)",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                No drums added for this company yet.
              </div>
              <button
                type="button"
                onClick={() => onOpenDrumModal(null)}
                className="btn btn-primary"
                style={{ fontSize: "0.75rem", padding: "5px 12px" }}
              >
                <Plus size={12} /> Add First Drum
              </button>
            </div>
          ) : (
            <>
              <select
                className="form-select"
                value={selectedDrumId || activeDrum?.id || ""}
                onChange={(e) => onSelectDrum(e.target.value)}
                style={{ fontWeight: "600", fontSize: "0.92rem" }}
              >
                {companyDrums.map((drum) => (
                  <option key={drum.id} value={drum.id}>
                    {drum.drumNumber} - {drum.type} ({drum.capacityLiters}L)
                  </option>
                ))}
              </select>

              <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                  <span>Dimensions:</span>
                  <span style={{ color: "#f8fafc", fontWeight: "500" }}>
                    Ø{activeDrum?.diameterMeters || 3}m × {activeDrum?.widthMeters || 2.5}m • Cap: {activeDrum?.capacityLiters} L
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Live Status:</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", color: activeDrum?.status === "Active" ? "#34d399" : "#fbbf24" }}>
                    <span className={`status-dot ${activeDrum?.status === "Active" ? "active" : "idle"}`} />
                    {activeDrum?.status || "Ready"} ({activeDrum?.currentRpm || 0} RPM)
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Step 3: Select Leather Type */}
        <div style={{
          background: "rgba(16, 24, 43, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <label className="form-label" style={{ margin: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Layers size={15} color="#10b981" />
                3. Leather Type
              </span>
            </label>
            <span className="badge badge-emerald" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
              Formula Spec
            </span>
          </div>

          <select
            className="form-select"
            value={selectedLeatherId}
            onChange={(e) => onSelectLeather(e.target.value)}
            style={{ fontWeight: "600", fontSize: "0.92rem" }}
          >
            {LEATHER_TYPES.map((leather) => (
              <option key={leather.id} value={leather.id}>
                {leather.name}
              </option>
            ))}
          </select>

          <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
              <span>Category:</span>
              <span style={{ color: "#f8fafc", fontWeight: "500" }}>{activeLeather?.category}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tannage Chemistry:</span>
              <span style={{ color: "var(--leather-amber)", fontWeight: "500" }}>
                {activeLeather?.tannageType.split("(")[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Load & Lot Metadata Bar */}
      <div style={{
        marginTop: "16px",
        background: "rgba(12, 18, 34, 0.9)",
        borderRadius: "10px",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        border: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          {/* Batch Weight Input */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}>
              <Scale size={14} color="var(--cyan-primary)" />
              Pelt/Shaved Weight:
            </label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="number"
                min="50"
                max="10000"
                step="50"
                value={batchWeightKg}
                onChange={(e) => onChangeBatchWeight(Number(e.target.value) || 1000)}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px 0 0 6px",
                  color: "#38bdf8",
                  fontWeight: "700",
                  fontFamily: "var(--font-mono)",
                  padding: "6px 10px",
                  width: "100px",
                  fontSize: "0.95rem",
                  textAlign: "right",
                  outline: "none"
                }}
              />
              <span style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderLeft: "none",
                borderRadius: "0 6px 6px 0",
                padding: "6px 10px",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                fontWeight: "600"
              }}>
                kg
              </span>
            </div>
          </div>

          {/* Lot Tracking Code */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              Tannery Lot Code:
            </label>
            <input
              type="text"
              value={lotNumber}
              onChange={(e) => onChangeLotNumber(e.target.value)}
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                color: "#f8fafc",
                fontWeight: "600",
                fontFamily: "var(--font-mono)",
                padding: "6px 12px",
                fontSize: "0.82rem",
                width: "180px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* Live Formula Dosage Info Pill */}
        <div style={{
          fontSize: "0.76rem",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <Info size={14} color="var(--cyan-primary)" />
          <span>
            Chemical kg quantities dynamically compute at <strong style={{ color: "#ffffff" }}>{batchWeightKg} kg</strong> batch basis.
          </span>
        </div>
      </div>
    </div>
  );
}
