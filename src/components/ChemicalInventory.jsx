import React, { useState } from "react";
import {
  Boxes,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  PackageCheck,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Sparkles,
  BookOpen
} from "lucide-react";
import {
  createChemical,
  updateChemical,
  deleteChemical,
  saveLocalInventory,
  loadStandardChemicalCatalog
} from "../services/firebase";

export default function ChemicalInventory({ inventory, onInventoryUpdated }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState(500);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [chemName, setChemName] = useState("");
  const [chemCode, setChemCode] = useState("");
  const [chemCategory, setChemCategory] = useState("Tanning Agent");
  const [chemStockKg, setChemStockKg] = useState(0);
  const [chemMinStockKg, setChemMinStockKg] = useState(500);
  const [chemUnitPriceUsd, setChemUnitPriceUsd] = useState(1.5);
  const [chemLocation, setChemLocation] = useState("Bay A - Heavy Chem Store");

  // Categories
  const categories = Array.from(new Set(inventory.map((item) => item.category)));

  // Filter inventory
  const filtered = inventory.filter((item) => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!item.name.toLowerCase().includes(term) && !item.code.toLowerCase().includes(term) && !item.location?.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  // Inventory Totals
  const totalStockKg = inventory.reduce((sum, item) => sum + (Number(item.currentStockKg) || 0), 0);
  const totalValueUsd = inventory.reduce((sum, item) => sum + (Number(item.currentStockKg) || 0) * (Number(item.unitPriceUsd) || 0), 0);
  const lowStockCount = inventory.filter((item) => item.currentStockKg <= item.minStockKg).length;
  const safetyHealthPercent = inventory.length > 0 ? Math.round(((inventory.length - lowStockCount) / inventory.length) * 100) : 100;

  // Handle Restock Submit
  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!restockItem) return;

    const updated = inventory.map((item) => {
      if (item.id === restockItem.id) {
        return {
          ...item,
          currentStockKg: item.currentStockKg + Number(restockAmount)
        };
      }
      return item;
    });

    saveLocalInventory(updated);
    if (onInventoryUpdated) onInventoryUpdated();
    setRestockItem(null);
  };

  // Open Add / Edit Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setChemName("");
    setChemCode("");
    setChemCategory("Tanning Agent");
    setChemStockKg(0);
    setChemMinStockKg(500);
    setChemUnitPriceUsd(1.5);
    setChemLocation("Bay A - Chemical Store");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setChemName(item.name);
    setChemCode(item.code);
    setChemCategory(item.category || "Tanning Agent");
    setChemStockKg(item.currentStockKg || 0);
    setChemMinStockKg(item.minStockKg || 500);
    setChemUnitPriceUsd(item.unitPriceUsd || 1.0);
    setChemLocation(item.location || "Store Room");
    setIsModalOpen(true);
  };

  const handleSaveChemical = async (e) => {
    e.preventDefault();
    if (!chemName.trim()) return;

    const payload = {
      name: chemName.trim(),
      code: (chemCode.trim() || chemName.slice(0, 4)).toUpperCase(),
      category: chemCategory,
      currentStockKg: Number(chemStockKg) || 0,
      minStockKg: Number(chemMinStockKg) || 500,
      unitPriceUsd: Number(chemUnitPriceUsd) || 1.0,
      location: chemLocation.trim() || "Main Warehouse"
    };

    if (editingItem) {
      await updateChemical(editingItem.id, payload);
    } else {
      await createChemical(payload);
    }

    if (onInventoryUpdated) onInventoryUpdated();
    setIsModalOpen(false);
  };

  const handleDeleteChemical = async (itemId, e) => {
    e.stopPropagation();
    if (window.confirm("Remove this chemical from inventory?")) {
      await deleteChemical(itemId);
      if (onInventoryUpdated) onInventoryUpdated();
    }
  };

  const handleLoadStandardCatalog = () => {
    if (window.confirm("Load standard tannery chemical catalog formulations with 0 kg initial stock? You can adjust actual stock quantities anytime.")) {
      loadStandardChemicalCatalog(0);
      if (onInventoryUpdated) onInventoryUpdated();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner & KPIs */}
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
              <span className="badge badge-purple">Tannery Warehouse</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {inventory.length} Chemical Products Monitored
              </span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc", margin: "6px 0 2px 0" }}>
              Leather Tannery Chemical Inventory Tracking
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
              Live stock levels of chromium salts, alkalis, vegetable polyphenols, synthetic resins, and fatliquors deducted automatically by drum logs.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleOpenAdd}
              className="btn btn-primary"
              style={{ fontSize: "0.8rem", padding: "7px 14px" }}
            >
              <Plus size={14} /> Add Chemical
            </button>

            {inventory.length === 0 && (
              <button
                onClick={handleLoadStandardCatalog}
                className="btn btn-leather"
                style={{ fontSize: "0.8rem", padding: "7px 14px" }}
                title="Populate standard tannery chemical names with 0 kg stock"
              >
                <BookOpen size={14} /> Load Chemical Presets
              </button>
            )}

            {inventory.length > 0 && (
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: lowStockCount > 0 ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                border: `1px solid ${lowStockCount > 0 ? "rgba(244, 63, 94, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                fontSize: "0.76rem",
                fontWeight: "700",
                color: lowStockCount > 0 ? "#fb7185" : "#34d399"
              }}>
                {lowStockCount > 0 ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                {lowStockCount > 0 ? `${lowStockCount} Reorder Alerts` : "All Stocks Above Minimum"}
              </span>
            )}
          </div>
        </div>

        {/* Inventory KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border-subtle)"
        }}>
          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Total Stock on Hand</div>
            <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
              {Math.round(totalStockKg).toLocaleString()} kg
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
              Across {inventory.length} formulations
            </div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Estimated Inventory Value</div>
            <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#34d399", fontFamily: "var(--font-mono)" }}>
              ${Math.round(totalValueUsd).toLocaleString()}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>At current purchase contract rates</div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Safety Buffer Health</div>
            <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--leather-amber)", fontFamily: "var(--font-mono)" }}>
              {safetyHealthPercent}%
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Stock-out risk index</div>
          </div>

          <div style={{ background: "rgba(16, 24, 43, 0.7)", padding: "12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Monitored Items</div>
            <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#c084fc", fontFamily: "var(--font-mono)" }}>
              {inventory.length} Chemicals
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Active tannery formulations</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        {inventory.length > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid var(--border-subtle)"
          }}>
            <div style={{ position: "relative", flex: "1 1 240px" }}>
              <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chemicals by commercial name, code, or bay..."
                style={{ paddingLeft: "34px", fontSize: "0.85rem" }}
              />
            </div>

            <select
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: "190px", fontSize: "0.82rem" }}
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Empty State or Inventory Grid */}
      {inventory.length === 0 ? (
        <div className="glass-panel" style={{ padding: "40px 20px", textAlign: "center" }}>
          <Boxes size={44} color="var(--text-muted)" style={{ margin: "0 auto 14px auto" }} />
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc", marginBottom: "6px" }}>
            No Chemicals in Inventory
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto 20px auto" }}>
            Add your tannery's chemicals to track actual stock quantities and automatic batch consumption, or load standard formulations.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              onClick={handleOpenAdd}
              className="btn btn-primary"
              style={{ fontSize: "0.85rem", padding: "8px 20px" }}
            >
              <Plus size={15} /> Add Chemical
            </button>
            <button
              onClick={handleLoadStandardCatalog}
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "8px 20px" }}
            >
              <BookOpen size={15} /> Load Standard Catalog
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "18px"
        }}>
          {filtered.map((item) => {
            const isLow = item.currentStockKg <= item.minStockKg;
            const percentOfMin = item.minStockKg > 0 ? Math.min(100, Math.round((item.currentStockKg / (item.minStockKg * 2.5)) * 100)) : 100;

            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: "18px",
                  border: isLow ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)",
                  boxShadow: isLow ? "0 4px 20px rgba(244, 63, 94, 0.15)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div>
                      <span className="badge badge-cyan" style={{ fontSize: "0.65rem", padding: "1px 6px", marginBottom: "4px" }}>
                        {item.category}
                      </span>
                      <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        Code: {item.code}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: isLow ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        color: isLow ? "#fb7185" : "#34d399",
                        border: `1px solid ${isLow ? "rgba(244, 63, 94, 0.3)" : "rgba(16, 185, 129, 0.3)"}`
                      }}>
                        {isLow ? "Low Stock" : "In Stock"}
                      </span>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: "3px"
                        }}
                        title="Edit Chemical"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChemical(item.id, e)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--rose-danger)",
                          cursor: "pointer",
                          padding: "3px"
                        }}
                        title="Delete Chemical"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Stock Level Bar */}
                  <div style={{ margin: "14px 0 10px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Current Level:</span>
                      <span style={{ fontWeight: "700", color: isLow ? "#fb7185" : "#f8fafc", fontFamily: "var(--font-mono)" }}>
                        {Number(item.currentStockKg).toLocaleString()} kg
                      </span>
                    </div>

                    <div style={{
                      width: "100%",
                      height: "8px",
                      background: "rgba(255, 255, 255, 0.08)",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${percentOfMin}%`,
                        height: "100%",
                        background: isLow ? "linear-gradient(90deg, #f43f5e, #fb7185)" : "linear-gradient(90deg, #06b6d4, #10b981)",
                        borderRadius: "4px",
                        transition: "width 0.4s ease"
                      }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      <span>Safety Min: {item.minStockKg} kg</span>
                      <span>Val: ${(item.currentStockKg * item.unitPriceUsd).toFixed(0)}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "14px" }}>
                    Storage: <strong style={{ color: "#ffffff" }}>{item.location || "General Store"}</strong>
                  </div>
                </div>

                {/* Restock Button */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                  <button
                    onClick={() => {
                      setRestockItem(item);
                      setRestockAmount(item.minStockKg || 500);
                    }}
                    className="btn btn-secondary"
                    style={{ width: "100%", padding: "7px", fontSize: "0.78rem" }}
                  >
                    <Plus size={14} color="var(--cyan-primary)" /> Restock Inventory
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setRestockItem(null)}>
          <div
            className="glass-panel"
            style={{
              maxWidth: "460px",
              width: "100%",
              padding: "24px",
              background: "#10182b",
              border: "1px solid var(--border-card)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc", marginBottom: "6px" }}>
              Restock Chemical Inventory
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Add shipment batch to <strong style={{ color: "#ffffff" }}>{restockItem.name}</strong> ({restockItem.code}).
            </p>

            <form onSubmit={handleRestockSubmit}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">
                  <span>Shipment Net Weight (kg)</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Current: {restockItem.currentStockKg} kg</span>
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  required
                  className="form-input font-mono"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="btn btn-secondary"
                  style={{ padding: "8px 16px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "8px 18px" }}
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Chemical Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setIsModalOpen(false)}>
          <div
            className="glass-panel"
            style={{
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              background: "#10182b",
              border: "1px solid var(--border-card)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                  {editingItem ? "Edit Chemical Product" : "Add Chemical to Inventory"}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, marginTop: "2px" }}>
                  Track warehouse inventory, code, and stock thresholds.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveChemical}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Chemical Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={chemName}
                    onChange={(e) => setChemName(e.target.value)}
                    placeholder="e.g. Basic Chromium Sulfate"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={chemCode}
                    onChange={(e) => setChemCode(e.target.value.toUpperCase())}
                    placeholder="CR2-SO4"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={chemCategory}
                  onChange={(e) => setChemCategory(e.target.value)}
                >
                  <option value="Tanning Agent">Tanning Agent</option>
                  <option value="Alkali">Alkali (Lime / Ca(OH)2)</option>
                  <option value="Unhairing">Unhairing (Sulfide / NaHS)</option>
                  <option value="Acid">Acid (Formic / Sulfuric)</option>
                  <option value="Vegetable Extract">Vegetable Extract (Mimosa / Quebracho)</option>
                  <option value="Syntan">Syntan / Polymer</option>
                  <option value="Fatliquor">Fatliquor / Oil</option>
                  <option value="Dyestuff">Dyestuff / Colorant</option>
                  <option value="Auxiliary">Auxiliary / Surfactant</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Current Stock (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="form-input font-mono"
                    value={chemStockKg}
                    onChange={(e) => setChemStockKg(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Safety Min Stock (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="form-input font-mono"
                    value={chemMinStockKg}
                    onChange={(e) => setChemMinStockKg(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div className="form-group">
                  <label className="form-label">Unit Price ($/kg)</label>
                  <input
                    type="number"
                    min="0.05"
                    step="0.05"
                    className="form-input font-mono"
                    value={chemUnitPriceUsd}
                    onChange={(e) => setChemUnitPriceUsd(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Storage Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={chemLocation}
                    onChange={(e) => setChemLocation(e.target.value)}
                    placeholder="Bay A - Storage"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: "8px 16px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "8px 20px" }}
                >
                  {editingItem ? "Save Changes" : "Add Chemical"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
