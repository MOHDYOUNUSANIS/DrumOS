import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Clock,
  Thermometer,
  Gauge,
  CheckCircle,
  AlertTriangle,
  Play,
  Save,
  RotateCw,
  Droplets,
  ShieldAlert,
  Beaker,
  ChevronRight,
  Database,
  Sparkles,
  FileCheck2,
  Check,
  Info,
  Disc3
} from "lucide-react";
import confetti from "canvas-confetti";
import { PROCESSING_STEPS_BY_LEATHER } from "../data/tanneryData";
import { saveProcessingActivity } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function ProcessFlowViewer({
  company,
  drum,
  leather,
  batchWeightKg,
  lotNumber,
  onActivitySaved
}) {
  const { currentUser } = useAuth();

  // Get steps for the chosen leather type (fallback to full_grain_bovine if needed)
  const steps = PROCESSING_STEPS_BY_LEATHER[leather.id] || PROCESSING_STEPS_BY_LEATHER["full_grain_bovine"];
  
  // Selected active step index
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = steps ? steps[activeStepIndex] || steps[0] : null;

  // Operator field recordings for this drum batch step
  const [operatorName, setOperatorName] = useState(currentUser?.name || "Tannery Operator");
  const [floatTempC, setFloatTempC] = useState(currentStep?.targetTempC || 30);
  const [floatPh, setFloatPh] = useState(
    typeof currentStep?.targetPh === "string" ? parseFloat(currentStep.targetPh.split("-")[0]) || 4.0 : 4.0
  );
  const [drumRpm, setDrumRpm] = useState(currentStep?.recommendedRpm || 8);
  const [actualRunMins, setActualRunMins] = useState(currentStep?.recommendedDurationMins || 60);
  const [qcNotes, setQcNotes] = useState("");
  const [qcStatus, setQcStatus] = useState("Approved");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // Chemical dosage inputs state
  const [chemicalMeasurements, setChemicalMeasurements] = useState({});

  // Reset measurements when step or batch weight changes
  useEffect(() => {
    if (currentStep) {
      setFloatTempC(currentStep.targetTempC || 30);
      const initialPh = typeof currentStep.targetPh === "string"
        ? parseFloat(currentStep.targetPh.split("-")[0]) || 4.0
        : 4.0;
      setFloatPh(initialPh);
      setDrumRpm(currentStep.recommendedRpm || 8);
      setActualRunMins(currentStep.recommendedDurationMins || 60);

      const initialMeasurements = {};
      if (currentStep.chemicals) {
        currentStep.chemicals.forEach((chem) => {
          const prescribed = Number(((batchWeightKg * chem.dosagePercent) / 100).toFixed(2));
          initialMeasurements[chem.id] = {
            actualKg: prescribed,
            verified: true,
            lot: `${chem.code}-${lotNumber ? lotNumber.slice(-3) : "001"}`
          };
        });
      }
      setChemicalMeasurements(initialMeasurements);
    }
  }, [currentStep, batchWeightKg, lotNumber]);

  // Keep operator synced with logged in profile
  useEffect(() => {
    if (currentUser?.name) {
      setOperatorName(currentUser.name);
    }
  }, [currentUser]);

  if (!company) {
    return null;
  }

  if (!drum) {
    return (
      <div className="glass-panel" style={{ padding: "36px 20px", textAlign: "center", marginBottom: "24px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "rgba(6, 182, 212, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px auto"
        }}>
          <Disc3 size={24} color="var(--cyan-primary)" />
        </div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc", marginBottom: "6px" }}>
          No Drums Registered for {company.name}
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
          Click <strong>"+ Add Drum"</strong> above to register a vessel for this tannery and view processing formulations.
        </p>
      </div>
    );
  }

  // Handle chemical actual input change
  const handleChemicalChange = (chemId, field, value) => {
    setChemicalMeasurements((prev) => ({
      ...prev,
      [chemId]: {
        ...prev[chemId],
        [field]: value
      }
    }));
  };

  // Direct Save to Firebase Function
  const handleSaveToFirebase = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);

    // Prepare chemical payload
    const chemicalsUsed = currentStep.chemicals.map((chem) => {
      const entry = chemicalMeasurements[chem.id] || {};
      const prescribed = Number(((batchWeightKg * chem.dosagePercent) / 100).toFixed(2));
      return {
        id: chem.id,
        code: chem.code,
        name: chem.name,
        dosagePercent: chem.dosagePercent,
        prescribedKg: prescribed,
        actualKg: Number(entry.actualKg) || prescribed,
        verified: !!entry.verified,
        lot: entry.lot || `${chem.code}-LOT`,
        hazard: chem.hazard,
        function: chem.function
      };
    });

    const activityPayload = {
      companyId: company.id,
      companyName: company.name,
      drumId: drum.id,
      drumNumber: drum.drumNumber,
      drumName: drum.name,
      leatherTypeId: leather.id,
      leatherTypeName: leather.name,
      lotNumber: lotNumber,
      batchWeightKg: Number(batchWeightKg),
      stepId: currentStep.stepId,
      stepNumber: currentStep.stepNumber,
      stepName: currentStep.name,
      phase: currentStep.phase,
      operatorName: operatorName,
      operatorRole: currentUser?.roleTitle || "Drum Operator",
      floatTempC: Number(floatTempC),
      floatPh: Number(floatPh),
      drumRpm: Number(drumRpm),
      actualRunDurationMins: Number(actualRunMins),
      qcStatus: qcStatus,
      qcNotes: qcNotes || `Batch step ${currentStep.name} completed under standard operating procedure.`,
      status: "Completed",
      chemicalsUsed: chemicalsUsed
    };

    try {
      const savedResult = await saveProcessingActivity(activityPayload);

      // Trigger celebratory particle effect
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#06b6d4', '#10b981', '#f59e0b']
        });
      } catch (err) {
        // Confetti fallback
      }

      setSaveSuccessMsg({
        id: savedResult.id,
        stepName: currentStep.name,
        drumNumber: drum.drumNumber,
        timestamp: savedResult.formattedDate,
        isSynced: savedResult.syncedToFirebase
      });

      if (onActivitySaved) {
        onActivitySaved(savedResult);
      }

      // Automatically auto-clear toast after 5 seconds
      setTimeout(() => {
        setSaveSuccessMsg(null);
      }, 6000);

    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving activity: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Save Success Alert Banner */}
      {saveSuccessMsg && (
        <div style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(16, 185, 129, 0.25)",
          animation: "fadeIn 0.3s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px #10b981"
            }}>
              <Check size={20} color="#ffffff" strokeWidth={3} />
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc" }}>
                Activity Successfully Recorded to Firebase Database!
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Logged <strong>{saveSuccessMsg.stepName}</strong> for <strong>{saveSuccessMsg.drumNumber}</strong> • Recorded at {saveSuccessMsg.timestamp}
              </div>
            </div>
          </div>
          <span className="badge badge-emerald font-mono">
            ID: {saveSuccessMsg.id.slice(0, 10)}...
          </span>
        </div>
      )}

      {/* Horizontal Steps Progression Bar */}
      <div className="glass-panel" style={{ padding: "16px 20px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px"
        }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--cyan-primary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Predefined Process Pipeline
            </span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
              {leather.name} ({steps.length} Sequenced Steps)
            </h3>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Step <strong style={{ color: "#ffffff" }}>{activeStepIndex + 1}</strong> of {steps.length}
          </div>
        </div>

        {/* Step Tabs Row */}
        <div style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "8px",
          scrollbarWidth: "thin"
        }}>
          {steps.map((step, idx) => {
            const isSelected = idx === activeStepIndex;
            const isPast = idx < activeStepIndex;
            return (
              <button
                key={step.stepId}
                onClick={() => setActiveStepIndex(idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: isSelected
                    ? "1px solid var(--cyan-primary)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(2, 132, 199, 0.15) 100%)"
                    : "rgba(16, 24, 43, 0.6)",
                  boxShadow: isSelected ? "0 0 16px rgba(6, 182, 212, 0.25)" : "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  minWidth: "190px"
                }}
              >
                <div style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: isSelected
                    ? "var(--cyan-primary)"
                    : isPast
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: isSelected ? "#000000" : isPast ? "#34d399" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.78rem",
                  fontWeight: "700"
                }}>
                  {isPast ? <Check size={14} /> : step.stepNumber}
                </div>
                <div>
                  <div style={{
                    fontSize: "0.82rem",
                    fontWeight: isSelected ? "700" : "600",
                    color: isSelected ? "#ffffff" : "var(--text-secondary)"
                  }}>
                    {step.name}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    {step.phase} • {step.recommendedDurationMins}m
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Interface: Left = Step Details & Chemicals, Right = Operator Recording Form */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
        gap: "24px",
      }}>
        {/* Left Column: Step Specifications & Associated Chemical List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Active Step Specifications Card */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "14px"
            }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: "6px" }}>
                  {currentStep.phase}
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                  {currentStep.name}
                </h3>
              </div>
              <span className="badge badge-purple font-mono" style={{ fontSize: "0.75rem" }}>
                Duration: ~{currentStep.recommendedDurationMins} Mins
              </span>
            </div>

            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.5 }}>
              {currentStep.description}
            </p>

            {/* Target Process Parameter Badges */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "10px",
              marginBottom: "16px"
            }}>
              <div style={{
                background: "rgba(16, 24, 43, 0.8)",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)"
              }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Droplets size={12} color="var(--cyan-primary)" /> Target Float
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#38bdf8", marginTop: "2px" }}>
                  {currentStep.targetFloatPercent}% ({Math.round(batchWeightKg * (currentStep.targetFloatPercent / 100))} L)
                </div>
              </div>

              <div style={{
                background: "rgba(16, 24, 43, 0.8)",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)"
              }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Thermometer size={12} color="var(--leather-amber)" /> Bath Temp
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#fbbf24", marginTop: "2px" }}>
                  {currentStep.targetTempC} °C
                </div>
              </div>

              <div style={{
                background: "rgba(16, 24, 43, 0.8)",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)"
              }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FlaskConical size={12} color="#10b981" /> Target pH
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#34d399", marginTop: "2px" }}>
                  {currentStep.targetPh}
                </div>
              </div>

              <div style={{
                background: "rgba(16, 24, 43, 0.8)",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)"
              }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <RotateCw size={12} color="#c084fc" /> Drum Speed
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#c084fc", marginTop: "2px" }}>
                  {currentStep.recommendedRpm} RPM
                </div>
              </div>
            </div>

            {/* Safety & Quality Instruction */}
            {currentStep.safetyInstructions && (
              <div style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                borderRadius: "8px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                fontSize: "0.8rem",
                color: "#fbbf24"
              }}>
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>Safety Protocol: </strong> {currentStep.safetyInstructions}
                </span>
              </div>
            )}
          </div>

          {/* Associated Chemicals Formulation Table */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px"
            }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Beaker size={18} color="var(--cyan-primary)" />
                  Associated Chemical Recipe ({currentStep.chemicals.length} Chemicals)
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0, marginTop: "2px" }}>
                  Calculated dosage for <strong style={{ color: "#ffffff" }}>{batchWeightKg} kg</strong> batch load
                </p>
              </div>
              <span className="badge badge-cyan font-mono" style={{ fontSize: "0.7rem" }}>
                LOT: {lotNumber}
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.82rem",
                textAlign: "left"
              }}>
                <thead>
                  <tr style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    color: "var(--text-muted)",
                    fontSize: "0.72rem",
                    textTransform: "uppercase"
                  }}>
                    <th style={{ padding: "8px 10px" }}>Chemical & Code</th>
                    <th style={{ padding: "8px 10px" }}>Function</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Formula %</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Prescribed</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Actual Added</th>
                    <th style={{ padding: "8px 10px", textAlign: "center" }}>Verify</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStep.chemicals.map((chem) => {
                    const prescribedKg = Number(((batchWeightKg * chem.dosagePercent) / 100).toFixed(2));
                    const entry = chemicalMeasurements[chem.id] || { actualKg: prescribedKg, verified: true };
                    
                    return (
                      <tr
                        key={chem.id}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <td style={{ padding: "10px" }}>
                          <div style={{ fontWeight: "600", color: "#f8fafc" }}>{chem.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                            <span className="font-mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{chem.code}</span>
                            <span style={{
                              fontSize: "0.62rem",
                              padding: "1px 5px",
                              borderRadius: "4px",
                              background: chem.hazard === "Corrosive" || chem.hazard === "Toxic"
                                ? "rgba(244, 63, 94, 0.2)"
                                : chem.hazard === "Harmful" || chem.hazard === "Irritant"
                                ? "rgba(245, 158, 11, 0.2)"
                                : "rgba(16, 185, 129, 0.2)",
                              color: chem.hazard === "Corrosive" || chem.hazard === "Toxic"
                                ? "#fb7185"
                                : chem.hazard === "Harmful" || chem.hazard === "Irritant"
                                ? "#fbbf24"
                                : "#34d399",
                              fontWeight: "700"
                            }}>
                              {chem.hazard}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                          {chem.function}
                        </td>

                        <td style={{ padding: "10px", textAlign: "right", fontWeight: "600", color: "var(--text-secondary)" }} className="font-mono">
                          {chem.dosagePercent}%
                        </td>

                        <td style={{ padding: "10px", textAlign: "right", fontWeight: "700", color: "var(--cyan-primary)" }} className="font-mono">
                          {prescribedKg} kg
                        </td>

                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <input
                            type="number"
                            step="0.1"
                            value={entry.actualKg}
                            onChange={(e) => handleChemicalChange(chem.id, "actualKg", e.target.value)}
                            style={{
                              background: "var(--bg-input)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "6px",
                              color: "#f8fafc",
                              fontSize: "0.85rem",
                              fontWeight: "700",
                              fontFamily: "var(--font-mono)",
                              padding: "5px 8px",
                              width: "80px",
                              textAlign: "right",
                              outline: "none"
                            }}
                          />
                        </td>

                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={entry.verified}
                            onChange={(e) => handleChemicalChange(chem.id, "verified", e.target.checked)}
                            style={{
                              width: "16px",
                              height: "16px",
                              accentColor: "var(--cyan-primary)",
                              cursor: "pointer"
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Factory Operator Processing Activity Recorder */}
        <div>
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--border-subtle)"
            }}>
              <div>
                <span className="badge badge-amber" style={{ marginBottom: "4px" }}>
                  Operational Logging Form
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                  Record Drum Activity
                </h3>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.75rem",
                color: "var(--cyan-primary)",
                fontWeight: "600"
              }}>
                <Database size={15} />
                <span>Target: Firebase DB</span>
              </div>
            </div>

            <form onSubmit={handleSaveToFirebase}>
              {/* Drum & Batch Summary Banner */}
              <div style={{
                background: "rgba(16, 24, 43, 0.7)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "18px",
                fontSize: "0.8rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px"
              }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Target Drum:</span>{" "}
                  <strong style={{ color: "var(--cyan-primary)" }}>{drum.drumNumber}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Company:</span>{" "}
                  <strong style={{ color: "#ffffff" }}>{company.code}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Leather:</span>{" "}
                  <strong style={{ color: "#ffffff" }}>{leather.name.slice(0, 18)}...</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Load:</span>{" "}
                  <strong style={{ color: "var(--leather-amber)" }}>{batchWeightKg} kg</strong>
                </div>
              </div>

              {/* Operator Name Field */}
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">
                  <span>Authorized Operator / Technician</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Signed in as</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="Enter operator full name"
                />
              </div>

              {/* Physical Readings: Float Temperature & Measured pH */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Thermometer size={14} color="var(--leather-amber)" /> Float Temp (°C)
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--leather-amber)" }}>Target: {currentStep.targetTempC}°C</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    className="form-input font-mono"
                    value={floatTempC}
                    onChange={(e) => setFloatTempC(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <FlaskConical size={14} color="#10b981" /> Measured pH
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#34d399" }}>Target: {currentStep.targetPh}</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="14"
                    required
                    className="form-input font-mono"
                    value={floatPh}
                    onChange={(e) => setFloatPh(e.target.value)}
                  />
                </div>
              </div>

              {/* Drum RPM Setting & Actual Run Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <RotateCw size={14} color="#c084fc" /> Drum RPM Setting
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#c084fc" }}>Rec: {currentStep.recommendedRpm}</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    required
                    className="form-input font-mono"
                    value={drumRpm}
                    onChange={(e) => setDrumRpm(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={14} color="var(--cyan-primary)" /> Run Duration (Mins)
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--cyan-primary)" }}>Rec: {currentStep.recommendedDurationMins}m</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="2880"
                    required
                    className="form-input font-mono"
                    value={actualRunMins}
                    onChange={(e) => setActualRunMins(e.target.value)}
                  />
                </div>
              </div>

              {/* QC Status & Inspection Notes */}
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Quality Control Status</label>
                <select
                  className="form-select"
                  value={qcStatus}
                  onChange={(e) => setQcStatus(e.target.value)}
                >
                  <option value="Approved">Approved (Meets Tannery Standard)</option>
                  <option value="In Progress">In Progress (Drum Running / In Cycle)</option>
                  <option value="Conditional Pass">Conditional Pass (Requires Re-Inspection)</option>
                  <option value="Hold / Flagged">Hold / Flagged for Chief Chemist Review</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">
                  <span>Operator Comments & Observations</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Optional</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={qcNotes}
                  onChange={(e) => setQcNotes(e.target.value)}
                  placeholder="e.g. Strike-through test complete. Bromocresol test shows uniform blue tint; solution completely exhausted."
                />
              </div>

              {/* Save Directly to Firebase Database Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  letterSpacing: "0.02em"
                }}
              >
                {isSaving ? (
                  <>
                    <RotateCw size={18} className="spin-clockwise" />
                    Saving Directly to Firebase Database...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Record & Save Activity to Firebase
                  </>
                )}
              </button>

              <div style={{
                textAlign: "center",
                marginTop: "10px",
                fontSize: "0.73rem",
                color: "var(--text-muted)"
              }}>
                Stored with exact ISO timestamp, drum identifier, chemicals dosage, and operator certificate.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
