import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  Printer,
  ChevronDown,
  Eye,
  Trash2,
  Calendar,
  Building2,
  Disc3,
  Layers,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  FileText
} from "lucide-react";
import { deleteProcessingActivity } from "../services/firebase";

export default function OperationHistory({
  activities,
  companies,
  onRefreshHistory
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterLeather, setFilterLeather] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState(null);

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (filterCompany !== "all" && act.companyId !== filterCompany) return false;
    if (filterLeather !== "all" && act.leatherTypeId !== filterLeather) return false;
    if (filterStatus !== "all" && act.qcStatus !== filterStatus) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchOperator = act.operatorName?.toLowerCase().includes(term);
      const matchDrum = act.drumNumber?.toLowerCase().includes(term);
      const matchStep = act.stepName?.toLowerCase().includes(term);
      const matchLot = act.lotNumber?.toLowerCase().includes(term);
      const matchCompany = act.companyName?.toLowerCase().includes(term);
      const matchChemicals = act.chemicalsUsed?.some((c) => c.name?.toLowerCase().includes(term));
      if (!matchOperator && !matchDrum && !matchStep && !matchLot && !matchCompany && !matchChemicals) {
        return false;
      }
    }
    return true;
  });

  // KPI calculations
  const totalChemicalsKg = filteredActivities.reduce((acc, act) => {
    const actTotal = act.chemicalsUsed?.reduce((sum, c) => sum + (Number(c.actualKg) || 0), 0) || 0;
    return acc + actTotal;
  }, 0);

  const approvedCount = filteredActivities.filter((a) => a.qcStatus === "Approved").length;
  const qcPassRate = filteredActivities.length > 0 ? Math.round((approvedCount / filteredActivities.length) * 100) : 0;

  // Delete activity
  const handleDeleteActivity = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this recorded operation from history?")) {
      await deleteProcessingActivity(id);
      if (onRefreshHistory) onRefreshHistory();
      if (selectedRecordForDetail?.id === id) setSelectedRecordForDetail(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredActivities.length === 0) {
      alert("No records to export.");
      return;
    }

    const headers = [
      "Activity ID",
      "Timestamp",
      "Company Name",
      "Drum Number",
      "Leather Type",
      "Lot Number",
      "Batch Weight (kg)",
      "Processing Step",
      "Float Temp (°C)",
      "Float pH",
      "Drum RPM",
      "Duration (mins)",
      "Operator Name",
      "QC Status",
      "Chemicals Breakdown"
    ];

    const rows = filteredActivities.map((act) => {
      const chemsSummary = act.chemicalsUsed
        ? act.chemicalsUsed.map((c) => `${c.name}: ${c.actualKg}kg`).join(" | ")
        : "";

      return [
        `"${act.id}"`,
        `"${act.formattedDate || act.recordedAt}"`,
        `"${act.companyName || act.companyId}"`,
        `"${act.drumNumber}"`,
        `"${act.leatherTypeName || act.leatherTypeId}"`,
        `"${act.lotNumber}"`,
        act.batchWeightKg || 0,
        `"${act.stepName}"`,
        act.floatTempC || 0,
        act.floatPh || 0,
        act.drumRpm || 0,
        act.actualRunDurationMins || 0,
        `"${act.operatorName}"`,
        `"${act.qcStatus}"`,
        `"${chemsSummary}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DrumsOS_Tannery_Operations_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable Tannery Run Sheet
  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Header Card */}
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
              <span className="badge badge-emerald">Firebase Database Log</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Audited Tannery Activity Trail
              </span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc", margin: "6px 0 2px 0" }}>
              Drum Operations & Chemical Audit History
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
              Query, audit, and analyze drum-by-drum leather processing activities recorded with exact formulations and timestamps.
            </p>
          </div>

          {/* Export Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleExportCSV}
              className="btn btn-outline"
              style={{ fontSize: "0.8rem", padding: "8px 14px" }}
            >
              <FileSpreadsheet size={15} color="#10b981" /> Export CSV
            </button>
            <button
              onClick={handlePrintSheet}
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "8px 14px" }}
            >
              <Printer size={15} /> Print Run Sheet
            </button>
          </div>
        </div>

        {/* History KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border-subtle)"
        }}>
          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Total Operations Saved</div>
            <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
              {filteredActivities.length}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>In Firebase Database</div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Chemicals Dispersed</div>
            <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--leather-amber)", fontFamily: "var(--font-mono)" }}>
              {Math.round(totalChemicalsKg).toLocaleString()} kg
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Net tracked additions</div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Batch Volume Logged</div>
            <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#34d399", fontFamily: "var(--font-mono)" }}>
              {filteredActivities.reduce((acc, a) => acc + (a.batchWeightKg || 0), 0).toLocaleString()} kg
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Pelt & crust leather</div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>QC First-Time Pass Rate</div>
            <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#c084fc", fontFamily: "var(--font-mono)" }}>
              {qcPassRate}%
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Chemist approval rate</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border-subtle)"
        }}>
          {/* Search Input */}
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by lot #, drum, operator, step, or chemical..."
              style={{ paddingLeft: "34px", fontSize: "0.85rem" }}
            />
          </div>

          {/* Company Filter */}
          <select
            className="form-select"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            style={{ width: "180px", fontSize: "0.82rem" }}
          >
            <option value="all">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* QC Status Filter */}
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: "150px", fontSize: "0.82rem" }}
          >
            <option value="all">All QC States</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Hold / Flagged">Hold / Flagged</option>
          </select>
        </div>
      </div>

      {/* History Data Table */}
      <div className="glass-panel" style={{ padding: "20px" }}>
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
                <th style={{ padding: "10px 12px" }}>Recorded Timestamp</th>
                <th style={{ padding: "10px 12px" }}>Company & Drum</th>
                <th style={{ padding: "10px 12px" }}>Leather & Lot</th>
                <th style={{ padding: "10px 12px" }}>Processing Step</th>
                <th style={{ padding: "10px 12px" }}>Readings (pH / °C)</th>
                <th style={{ padding: "10px 12px" }}>Chemicals Added</th>
                <th style={{ padding: "10px 12px" }}>Operator</th>
                <th style={{ padding: "10px 12px" }}>QC Status</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                    No processing activities match your criteria. Try adjusting your filters or record a new activity from the Process tab.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => {
                  const chemsCount = act.chemicalsUsed ? act.chemicalsUsed.length : 0;
                  const totalKg = act.chemicalsUsed
                    ? act.chemicalsUsed.reduce((sum, c) => sum + (Number(c.actualKg) || 0), 0).toFixed(1)
                    : 0;

                  return (
                    <tr
                      key={act.id}
                      onClick={() => setSelectedRecordForDetail(act)}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        cursor: "pointer",
                        transition: "background 0.15s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "600", color: "#f8fafc" }}>
                          {act.formattedDate || new Date(act.recordedAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {act.id}
                        </div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "700", color: "var(--cyan-primary)" }}>
                          {act.drumNumber}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          {act.companyName?.split(" ")[0]}
                        </div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "600", color: "#f8fafc" }}>
                          {act.leatherTypeName}
                        </div>
                        <div className="font-mono" style={{ fontSize: "0.72rem", color: "var(--leather-amber)" }}>
                          {act.lotNumber} ({act.batchWeightKg} kg)
                        </div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "600", color: "#f8fafc" }}>
                          {act.stepName}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {act.phase} • {act.actualRunDurationMins}m
                        </div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#34d399",
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono)",
                            fontWeight: "700"
                          }}>
                            pH {act.floatPh}
                          </span>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "#fbbf24",
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono)",
                            fontWeight: "700"
                          }}>
                            {act.floatTempC}°C
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "700", color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                          {totalKg} kg
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {chemsCount} chemicals logged
                        </div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "600", color: "#f8fafc" }}>
                          {act.operatorName}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                          {act.operatorRole || "Operator"}
                        </div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          background: act.qcStatus === "Approved"
                            ? "rgba(16, 185, 129, 0.15)"
                            : act.qcStatus === "In Progress"
                            ? "rgba(6, 182, 212, 0.15)"
                            : "rgba(245, 158, 11, 0.15)",
                          color: act.qcStatus === "Approved"
                            ? "#34d399"
                            : act.qcStatus === "In Progress"
                            ? "#38bdf8"
                            : "#fbbf24",
                          border: `1px solid ${act.qcStatus === "Approved" ? "rgba(16, 185, 129, 0.3)" : "rgba(6, 182, 212, 0.3)"}`
                        }}>
                          {act.qcStatus}
                        </span>
                      </td>

                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecordForDetail(act);
                            }}
                            className="btn btn-outline"
                            style={{ padding: "5px 8px", fontSize: "0.72rem" }}
                            title="View Chemical Receipt"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteActivity(act.id, e)}
                            className="btn btn-outline"
                            style={{ padding: "5px 8px", fontSize: "0.72rem", color: "var(--rose-danger)" }}
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Chemical Receipt Modal */}
      {selectedRecordForDetail && (
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
        }} onClick={() => setSelectedRecordForDetail(null)}>
          <div
            className="glass-panel"
            style={{
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
              background: "#10182b",
              border: "1px solid var(--border-card)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--border-subtle)"
            }}>
              <div>
                <span className="badge badge-cyan font-mono" style={{ marginBottom: "6px" }}>
                  Record ID: {selectedRecordForDetail.id}
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                  Tannery Chemical Dosage Receipt
                </h3>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {selectedRecordForDetail.stepName} • {selectedRecordForDetail.drumNumber}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Run Metadata Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "10px",
              marginBottom: "20px",
              background: "rgba(16, 24, 43, 0.8)",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)"
            }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Company / Tannery</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff" }}>
                  {selectedRecordForDetail.companyName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Leather Grade & Lot</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--leather-amber)" }}>
                  {selectedRecordForDetail.lotNumber} ({selectedRecordForDetail.batchWeightKg} kg)
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Timestamp Recorded</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff" }}>
                  {selectedRecordForDetail.formattedDate}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Operator Signature</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#34d399" }}>
                  {selectedRecordForDetail.operatorName} ({selectedRecordForDetail.operatorRole})
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Float Physical Readings</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#38bdf8" }}>
                  pH {selectedRecordForDetail.floatPh} | {selectedRecordForDetail.floatTempC}°C | {selectedRecordForDetail.drumRpm} RPM
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Run Duration</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff" }}>
                  {selectedRecordForDetail.actualRunDurationMins} Minutes
                </div>
              </div>
            </div>

            {/* Chemicals Breakdown List */}
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", marginBottom: "10px" }}>
              Chemical Formulations Dispersed:
            </h4>
            <div style={{
              background: "rgba(16, 24, 43, 0.5)",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden",
              marginBottom: "18px"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Chemical Name</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Prescribed</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Actual Added</th>
                    <th style={{ padding: "8px 12px", textAlign: "center" }}>Hazard</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecordForDetail.chemicalsUsed?.map((chem, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: "600", color: "#ffffff" }}>{chem.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{chem.code} • {chem.function}</div>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-secondary)" }} className="font-mono">
                        {chem.prescribedKg} kg
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", color: "var(--cyan-primary)" }} className="font-mono">
                        {chem.actualKg} kg
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span style={{
                          fontSize: "0.65rem",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "var(--text-secondary)"
                        }}>
                          {chem.hazard || "Safe"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Remarks & QC Comments */}
            {selectedRecordForDetail.qcNotes && (
              <div style={{
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(6, 182, 212, 0.25)",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "0.82rem",
                color: "#e2e8f0",
                marginBottom: "16px"
              }}>
                <strong>QC Chemist / Operator Notes: </strong>
                {selectedRecordForDetail.qcNotes}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="btn btn-secondary"
                style={{ padding: "8px 18px" }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
