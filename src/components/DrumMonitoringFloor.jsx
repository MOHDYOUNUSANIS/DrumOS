import React, { useState } from "react";
import {
  Activity,
  RotateCw,
  Thermometer,
  Gauge,
  Droplets,
  Layers,
  Pause,
  Play,
  Clock,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  Plus,
  Disc3
} from "lucide-react";
import { updateDrumTelemetry } from "../services/firebase";

export default function DrumMonitoringFloor({
  drums,
  companies,
  selectedCompanyId,
  onSelectDrumForProcess,
  onDrumsUpdated,
  onOpenDrumModal
}) {
  const [filterCompany, setFilterCompany] = useState(selectedCompanyId || "all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter drums based on company and status
  const visibleDrums = drums.filter((drum) => {
    if (filterCompany !== "all" && drum.companyId !== filterCompany) return false;
    if (filterStatus !== "all" && drum.status !== filterStatus) return false;
    return true;
  });

  // Toggle Drum running / paused
  const handleToggleDrumState = async (drum, e) => {
    e.stopPropagation();
    const newStatus = drum.status === "Active" ? "Idle" : "Active";
    const newRpm = newStatus === "Active" ? (drum.maxRpm ? Math.round(drum.maxRpm * 0.7) : 10) : 0;
    
    await updateDrumTelemetry(drum.id, {
      status: newStatus,
      currentRpm: newRpm
    });

    if (onDrumsUpdated) {
      onDrumsUpdated();
    }
  };

  // Quick adjust RPM
  const handleRpmChange = async (drum, delta, e) => {
    e.stopPropagation();
    const newRpm = Math.max(0, Math.min(drum.maxRpm || 24, (drum.currentRpm || 0) + delta));
    await updateDrumTelemetry(drum.id, {
      currentRpm: newRpm,
      status: newRpm > 0 ? "Active" : "Idle"
    });
    if (onDrumsUpdated) {
      onDrumsUpdated();
    }
  };

  const activeDrumsCount = drums.filter((d) => d.status === "Active").length;
  const utilizationPercent = drums.length > 0 ? Math.round((activeDrumsCount / drums.length) * 100) : 0;
  const avgTemp = drums.length > 0 ? Math.round(drums.reduce((acc, d) => acc + (d.currentTempC || 25), 0) / drums.length) : 0;
  const totalCapacityKl = (drums.reduce((acc, d) => acc + (d.capacityLiters || 0), 0) / 1000).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Floor Overview Header */}
      <div className="glass-panel" style={{ padding: "20px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "16px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge badge-cyan">Real-Time Telemetry</span>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.75rem",
                color: "#34d399",
                fontFamily: "var(--font-mono)"
              }}>
                <span className="status-dot active" /> SENSORS ONLINE
              </span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc", margin: "6px 0 2px 0" }}>
              Tannery Floor Live Drum Status & Monitoring
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
              Live mechanical telemetry, drum RPM rotation speed, bath temperature, and pH monitoring across factory drums.
            </p>
          </div>

          {/* Actions & Filter Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {companies.length > 0 && (
              <button
                onClick={() => onOpenDrumModal && onOpenDrumModal(null)}
                className="btn btn-primary"
                style={{ fontSize: "0.8rem", padding: "7px 14px" }}
              >
                <Plus size={14} /> Add Drum
              </button>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Company:</span>
              <select
                className="form-select"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                style={{ fontSize: "0.8rem", padding: "6px 10px", width: "170px" }}
              >
                <option value="all">All Companies ({drums.length} Drums)</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Status:</span>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ fontSize: "0.8rem", padding: "6px 10px", width: "130px" }}
              >
                <option value="all">All States</option>
                <option value="Active">Active / Running</option>
                <option value="Idle">Idle / Stopped</option>
                <option value="Draining">Draining</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Floor KPI Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border-subtle)"
        }}>
          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Active Rotating Drums</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#34d399", fontFamily: "var(--font-mono)" }}>
              {activeDrumsCount} / {drums.length}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
              {utilizationPercent}% Floor Utilization
            </div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Active Leather in Process</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--cyan-primary)", fontFamily: "var(--font-mono)" }}>
              {drums.reduce((acc, d) => acc + (d.status === "Active" ? (d.batchWeightKg || 0) : 0), 0).toLocaleString()} kg
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Across active vessels</div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Average Float Temp</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fbbf24", fontFamily: "var(--font-mono)" }}>
              {avgTemp} °C
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Thermal regulation steady</div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Total Liquid Float Cap</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#c084fc", fontFamily: "var(--font-mono)" }}>
              {totalCapacityKl} kL
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Vessel displacement capacity</div>
          </div>
        </div>
      </div>

      {/* Visual Drum Grid or Empty State */}
      {visibleDrums.length === 0 ? (
        <div className="glass-panel" style={{ padding: "40px 20px", textAlign: "center" }}>
          <Disc3 size={44} color="var(--text-muted)" style={{ margin: "0 auto 14px auto" }} />
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc", marginBottom: "6px" }}>
            No Drums Configured on Tannery Floor
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto 20px auto" }}>
            {companies.length === 0
              ? "Start by creating a company, then configure its drum vessels to view real-time rotation speed, pH, and batch telemetry."
              : "Register your tannery's drum vessels to monitor real-time mechanical rotation, motor RPM, and solution temperature."}
          </p>
          {companies.length > 0 && (
            <button
              onClick={() => onOpenDrumModal && onOpenDrumModal(null)}
              className="btn btn-primary"
              style={{ fontSize: "0.85rem", padding: "8px 20px" }}
            >
              <Plus size={15} /> Add First Drum
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
          gap: "18px"
        }}>
          {visibleDrums.map((drum) => {
            const isSpinning = drum.status === "Active" && drum.currentRpm > 0;
            const rotationDuration = drum.currentRpm > 0 ? `${Math.max(1, 20 / drum.currentRpm)}s` : "0s";
            const companyObj = companies.find((c) => c.id === drum.companyId);

            return (
              <div
                key={drum.id}
                className="glass-panel"
                style={{
                  padding: "20px",
                  position: "relative",
                  overflow: "hidden",
                  border: drum.status === "Active" ? "1px solid rgba(6, 182, 212, 0.4)" : "1px solid var(--border-subtle)",
                  boxShadow: drum.status === "Active" ? "0 4px 20px rgba(6, 182, 212, 0.15)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Header: Drum # and Company */}
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "14px"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                        {drum.drumNumber}
                      </h3>
                      {companyObj && (
                        <span style={{ fontSize: "0.7rem", color: "var(--leather-amber)", fontWeight: "600" }}>
                          ({companyObj.code})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {drum.type}
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: drum.status === "Active" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    border: `1px solid ${drum.status === "Active" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    color: drum.status === "Active" ? "#34d399" : "#fbbf24"
                  }}>
                    <span className={`status-dot ${drum.status === "Active" ? "active" : "idle"}`} />
                    {drum.status}
                  </div>
                </div>

                {/* Graphic Drum Visualization with Spinning Animation */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 0",
                  background: "rgba(12, 18, 34, 0.6)",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  position: "relative"
                }}>
                  {/* Visual Drum Cylinder */}
                  <div style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: drum.type.includes("Stainless")
                      ? "radial-gradient(circle, #334155 0%, #1e293b 70%, #0f172a 100%)"
                      : "radial-gradient(circle, #78350f 0%, #451a03 70%, #1e293b 100%)",
                    border: `4px solid ${drum.status === "Active" ? "var(--cyan-primary)" : "#475569"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: drum.status === "Active" ? "0 0 25px rgba(6, 182, 212, 0.35)" : "none",
                    position: "relative"
                  }}>
                    {/* Rotating Spokes and Pegs */}
                    <div style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: isSpinning ? `spinSlow ${rotationDuration} linear infinite` : "none"
                    }}>
                      <div style={{ position: "absolute", width: "90%", height: "2px", background: "rgba(255, 255, 255, 0.25)" }} />
                      <div style={{ position: "absolute", height: "90%", width: "2px", background: "rgba(255, 255, 255, 0.25)" }} />
                      <div style={{ position: "absolute", width: "80%", height: "2px", transform: "rotate(45deg)", background: "rgba(255, 255, 255, 0.15)" }} />
                      <div style={{ position: "absolute", width: "80%", height: "2px", transform: "rotate(-45deg)", background: "rgba(255, 255, 255, 0.15)" }} />
                      <div style={{ position: "absolute", top: "12px", width: "8px", height: "8px", borderRadius: "50%", background: "#ffffff" }} />
                      <div style={{ position: "absolute", bottom: "12px", width: "8px", height: "8px", borderRadius: "50%", background: "#ffffff" }} />
                      <div style={{ position: "absolute", left: "12px", width: "8px", height: "8px", borderRadius: "50%", background: "#ffffff" }} />
                      <div style={{ position: "absolute", right: "12px", width: "8px", height: "8px", borderRadius: "50%", background: "#ffffff" }} />
                    </div>

                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#0f172a",
                      border: "2px solid #94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      fontSize: "0.68rem",
                      fontWeight: "800",
                      fontFamily: "var(--font-mono)",
                      color: drum.status === "Active" ? "var(--cyan-primary)" : "#64748b"
                    }}>
                      {drum.currentRpm || 0}
                    </div>
                  </div>

                  <div style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "12px",
                    background: "rgba(16, 24, 43, 0.9)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "0.72rem",
                    fontFamily: "var(--font-mono)",
                    color: isSpinning ? "#38bdf8" : "var(--text-muted)",
                    fontWeight: "700"
                  }}>
                    {drum.currentRpm || 0} RPM
                  </div>
                </div>

                {/* Batch Processing Status */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Current Step:</div>
                  <div style={{ fontSize: "0.86rem", fontWeight: "700", color: "#f8fafc" }}>
                    {drum.currentStep || "Ready for Loading"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--leather-amber)", marginTop: "2px" }}>
                    {drum.currentLeather || "Unassigned"}
                  </div>
                </div>

                {/* Sensor Telemetry Badges */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                  marginBottom: "16px"
                }}>
                  <div style={{
                    background: "rgba(16, 24, 43, 0.8)",
                    padding: "8px",
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Float Temp</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#fbbf24", fontFamily: "var(--font-mono)" }}>
                      {drum.currentTempC || 25}°C
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(16, 24, 43, 0.8)",
                    padding: "8px",
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Float pH</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#34d399", fontFamily: "var(--font-mono)" }}>
                      {drum.currentPh || 7.0}
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(16, 24, 43, 0.8)",
                    padding: "8px",
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Load (kg)</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                      {drum.batchWeightKg || 0}
                    </div>
                  </div>
                </div>

                {/* Operator Quick Controls */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "12px"
                }}>
                  <button
                    onClick={(e) => handleToggleDrumState(drum, e)}
                    className={`btn ${drum.status === "Active" ? "btn-secondary" : "btn-emerald"}`}
                    style={{ flex: 1, padding: "7px 10px", fontSize: "0.78rem" }}
                  >
                    {drum.status === "Active" ? (
                      <>
                        <Pause size={14} /> Stop Drum
                      </>
                    ) : (
                      <>
                        <Play size={14} /> Start Drum
                      </>
                    )}
                  </button>

                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={(e) => handleRpmChange(drum, -2, e)}
                      disabled={drum.currentRpm <= 0}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "6px",
                        color: "#ffffff",
                        padding: "6px 9px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: "700"
                      }}
                      title="Decrease RPM"
                    >
                      -2
                    </button>
                    <button
                      onClick={(e) => handleRpmChange(drum, 2, e)}
                      disabled={drum.currentRpm >= (drum.maxRpm || 24)}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "6px",
                        color: "#ffffff",
                        padding: "6px 9px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: "700"
                      }}
                      title="Increase RPM"
                    >
                      +2
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectDrumForProcess(drum)}
                    className="btn btn-outline"
                    style={{ padding: "7px 10px", fontSize: "0.75rem" }}
                    title="Load Drum in Recipe Processing Suite"
                  >
                    Log Step
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
