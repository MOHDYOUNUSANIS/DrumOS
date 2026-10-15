import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  PieChart,
  Layers,
  Scale,
  Calendar,
  Building2,
  Droplets,
  ShieldCheck,
  Zap,
  Download
} from "lucide-react";
import { LEATHER_TYPES } from "../data/tanneryData";

export default function ProductionReports({ activities, drums, companies }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");

  const filteredActs = selectedCompanyId === "all"
    ? activities
    : activities.filter((a) => a.companyId === selectedCompanyId);

  // Aggregated throughput
  const totalWeightKg = filteredActs.reduce((acc, a) => acc + (a.batchWeightKg || 0), 0);
  const estimatedHidesProcessed = Math.round(totalWeightKg / 24); // Avg 24kg per hide

  // Chemical consumption
  const totalChemsKg = filteredActs.reduce((acc, a) => {
    return acc + (a.chemicalsUsed?.reduce((sum, c) => sum + (Number(c.actualKg) || 0), 0) || 0);
  }, 0);

  // Group by Leather Type
  const leatherBreakdown = LEATHER_TYPES.map((leather) => {
    const leatherActs = filteredActs.filter((a) => a.leatherTypeId === leather.id);
    const weight = leatherActs.reduce((sum, a) => sum + (a.batchWeightKg || 0), 0);
    return {
      id: leather.id,
      name: leather.name,
      batchesCount: leatherActs.length,
      weightKg: weight,
      percentOfTotal: totalWeightKg > 0 ? Math.round((weight / totalWeightKg) * 100) : 0
    };
  }).filter((item) => item.batchesCount > 0 || totalWeightKg === 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
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
              <span className="badge badge-amber">Executive Tannery Intelligence</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Yield & Operational Metrics
              </span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc", margin: "6px 0 2px 0" }}>
              Production Throughput & Chemical Consumption Reports
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
              Batch yield metrics, chemical dosage ratios per metric ton, drum capacity utilization, and multi-tenant performance.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Entity:</span>
            <select
              className="form-select"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              style={{ width: "200px", fontSize: "0.82rem" }}
            >
              <option value="all">Consolidated (All Companies)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* High-level KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "12px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border-subtle)"
        }}>
          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "14px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
              <Scale size={13} color="var(--cyan-primary)" /> Leather Processed
            </div>
            <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
              {totalWeightKg.toLocaleString()} kg
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
              ~{estimatedHidesProcessed.toLocaleString()} Equivalent Hides
            </div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "14px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
              <Droplets size={13} color="var(--leather-amber)" /> Chemical Dosage Ratio
            </div>
            <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "var(--leather-amber)", fontFamily: "var(--font-mono)" }}>
              {totalWeightKg > 0 ? Math.round((totalChemsKg / totalWeightKg) * 1000) : 0} kg/ton
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
              Chemical kg per metric ton pelt
            </div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "14px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
              <Zap size={13} color="#10b981" /> Drum Active Ratio
            </div>
            <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "#34d399", fontFamily: "var(--font-mono)" }}>
              {drums.length > 0 ? Math.round((drums.filter(d => d.status === "Active").length / drums.length) * 100) : 0}%
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
              Vessels currently running
            </div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "14px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
              <ShieldCheck size={13} color="#c084fc" /> Compliance / Cert
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#c084fc", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {companies.find(c => c.id === selectedCompanyId)?.certifications?.[0] || (companies[0]?.certifications?.[0] || "Standard")}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
              Environmental standard
            </div>
          </div>
        </div>
      </div>

      {/* Production by Leather Type Breakdown */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "20px"
      }}>
        {/* Leather Grades Production Table */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", marginBottom: "4px" }}>
            Throughput by Leather Grade
          </h3>
          <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Volume distribution of bovine shoe uppers, sheepskin nappa, vegetable sole, and automotive leathers.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {leatherBreakdown.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "rgba(16, 24, 43, 0.7)",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff" }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--cyan-primary)", fontFamily: "var(--font-mono)" }}>
                    {item.weightKg.toLocaleString()} kg ({item.percentOfTotal}%)
                  </span>
                </div>

                <div style={{
                  width: "100%",
                  height: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "3px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${Math.max(5, item.percentOfTotal)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #06b6d4, #d97706)",
                    borderRadius: "3px"
                  }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  <span>{item.batchesCount} Batches executed</span>
                  <span>~{Math.round(item.weightKg / 24)} hides</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drum Utilization Ranking Card */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", marginBottom: "4px" }}>
            Drum Vessel Utilization Matrix
          </h3>
          <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Operating hours, load capacity utilization, and motor wear index across active machinery.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {drums.slice(0, 6).map((drum) => {
              const utilPercent = Math.min(100, Math.round(((drum.batchWeightKg || 1200) / drum.maxLoadKg) * 100));

              return (
                <div
                  key={drum.id}
                  style={{
                    background: "rgba(16, 24, 43, 0.7)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#ffffff" }}>
                      {drum.drumNumber}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {drum.type} • {drum.capacityLiters} L
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", color: utilPercent > 85 ? "#fbbf24" : "#34d399", fontFamily: "var(--font-mono)" }}>
                      {utilPercent}% Load
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {drum.batchWeightKg} / {drum.maxLoadKg} kg
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
