import React, { useState, useEffect } from "react";
import {
  Disc3,
  X,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  Gauge
} from "lucide-react";
import { createDrum, updateDrum, deleteDrum } from "../services/firebase";

export default function DrumModal({
  isOpen,
  onClose,
  companies,
  selectedCompanyId,
  drumToEdit = null,
  onDrumSaved,
  onDrumDeleted
}) {
  const [targetCompanyId, setTargetCompanyId] = useState(selectedCompanyId || companies[0]?.id || "");
  const [drumNumber, setDrumNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("Stainless Steel Milling Drum");
  const [capacityLiters, setCapacityLiters] = useState(6500);
  const [maxLoadKg, setMaxLoadKg] = useState(2000);
  const [diameterMeters, setDiameterMeters] = useState(3.2);
  const [widthMeters, setWidthMeters] = useState(2.8);
  const [maxRpm, setMaxRpm] = useState(18);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (drumToEdit) {
      setTargetCompanyId(drumToEdit.companyId || selectedCompanyId || "");
      setDrumNumber(drumToEdit.drumNumber || "");
      setName(drumToEdit.name || "");
      setType(drumToEdit.type || "Stainless Steel Milling Drum");
      setCapacityLiters(drumToEdit.capacityLiters || 6500);
      setMaxLoadKg(drumToEdit.maxLoadKg || 2000);
      setDiameterMeters(drumToEdit.diameterMeters || 3.2);
      setWidthMeters(drumToEdit.widthMeters || 2.8);
      setMaxRpm(drumToEdit.maxRpm || 18);
    } else {
      setTargetCompanyId(selectedCompanyId || companies[0]?.id || "");
      setDrumNumber("Drum #01");
      setName("Drum #01 (Wet-End Drum)");
      setType("Stainless Steel Milling Drum");
      setCapacityLiters(6500);
      setMaxLoadKg(2000);
      setDiameterMeters(3.2);
      setWidthMeters(2.8);
      setMaxRpm(18);
    }
    setErrorMsg(null);
  }, [drumToEdit, selectedCompanyId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!drumNumber.trim()) {
      setErrorMsg("Drum identifier/number is required.");
      return;
    }

    if (!targetCompanyId) {
      setErrorMsg("Please select a target company.");
      return;
    }

    const payload = {
      companyId: targetCompanyId,
      drumNumber: drumNumber.trim(),
      name: name.trim() || drumNumber.trim(),
      type: type,
      capacityLiters: Number(capacityLiters) || 5000,
      maxLoadKg: Number(maxLoadKg) || 1800,
      diameterMeters: Number(diameterMeters) || 3.0,
      widthMeters: Number(widthMeters) || 2.5,
      maxRpm: Number(maxRpm) || 16,
    };

    try {
      if (drumToEdit) {
        const updated = await updateDrum(drumToEdit.id, payload);
        if (onDrumSaved) onDrumSaved(updated);
      } else {
        const created = await createDrum(payload);
        if (onDrumSaved) onDrumSaved(created);
      }
      onClose();
    } catch (err) {
      setErrorMsg("Error saving drum: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!drumToEdit) return;
    if (window.confirm(`Delete ${drumToEdit.drumNumber}? This cannot be undone.`)) {
      await deleteDrum(drumToEdit.id);
      if (onDrumDeleted) onDrumDeleted(drumToEdit.id);
      onClose();
    }
  };

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
          maxWidth: "560px",
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
              <span className="badge badge-cyan">Vessel Configuration</span>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: "4px 0 2px 0" }}>
              {drumToEdit ? `Edit ${drumToEdit.drumNumber}` : "Add Tannery Drum"}
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
              Specify vessel mechanical parameters, rotation limits, and volume capacity.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "14px",
            fontSize: "0.78rem",
            color: "#fb7185",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Target Company */}
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Building2 size={13} color="var(--leather-amber)" /> Assigned Tannery Company *
              </span>
            </label>
            <select
              className="form-select"
              value={targetCompanyId}
              onChange={(e) => setTargetCompanyId(e.target.value)}
              required
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div className="form-group">
              <label className="form-label">Drum Number / Code *</label>
              <input
                type="text"
                required
                className="form-input font-mono"
                value={drumNumber}
                onChange={(e) => setDrumNumber(e.target.value)}
                placeholder="e.g. Drum #01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Drum Name / Stage</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Beamhouse Liming Drum"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label className="form-label">Drum Construction Type</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Stainless Steel Milling Drum">Stainless Steel Milling Drum</option>
              <option value="African Iroko Hardwood Drum">African Iroko Hardwood Drum</option>
              <option value="Polypropylene Lined Wet-End Drum">Polypropylene Lined Wet-End Drum</option>
              <option value="Double Shell Computerized Dyeing Drum">Double Shell Computerized Dyeing Drum</option>
              <option value="Heavy Beamhouse Wooden Drum">Heavy Beamhouse Wooden Drum</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div className="form-group">
              <label className="form-label">Float Capacity (Liters)</label>
              <input
                type="number"
                min="500"
                step="250"
                className="form-input font-mono"
                value={capacityLiters}
                onChange={(e) => setCapacityLiters(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Pelt Load (kg)</label>
              <input
                type="number"
                min="200"
                step="100"
                className="form-input font-mono"
                value={maxLoadKg}
                onChange={(e) => setMaxLoadKg(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            <div className="form-group">
              <label className="form-label">Diameter (m)</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="8.0"
                className="form-input font-mono"
                value={diameterMeters}
                onChange={(e) => setDiameterMeters(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Width (m)</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="8.0"
                className="form-input font-mono"
                value={widthMeters}
                onChange={(e) => setWidthMeters(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max RPM</label>
              <input
                type="number"
                min="4"
                max="32"
                className="form-input font-mono"
                value={maxRpm}
                onChange={(e) => setMaxRpm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {drumToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-outline"
                style={{ color: "var(--rose-danger)", fontSize: "0.8rem", padding: "8px 14px" }}
              >
                <Trash2 size={14} /> Delete Drum
              </button>
            ) : <div />}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={onClose}
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
                {drumToEdit ? "Update Drum" : "Add Drum"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
