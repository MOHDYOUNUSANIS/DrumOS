import React, { useState } from "react";
import {
  Layers,
  Activity,
  History,
  Boxes,
  BarChart3,
  Database,
  Building2,
  ChevronDown,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Settings,
  Sparkles,
  Plus,
  Edit3,
  Upload,
  LogOut,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isCustomFirebaseConfigured } from "../services/firebase";

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenFirebaseModal,
  onOpenCompanyModal
}) {
  const {
    currentUser,
    activeCompany,
    companies,
    switchCompany,
    switchRole,
    userRoles,
    updateProfileName
  } = useAuth();

  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.name || "");

  const isCustomCloud = isCustomFirebaseConfigured();

  const navItems = [
    { id: "process", label: "Process & Logging", icon: Layers, badge: "Core" },
    { id: "floor", label: "Live Drum Floor", icon: Activity, pulse: true },
    { id: "history", label: "Operations History", icon: History },
    { id: "inventory", label: "Chemical Inventory", icon: Boxes },
    { id: "reports", label: "Production Reports", icon: BarChart3 },
  ];

  const handleSaveName = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateProfileName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  return (
    <header style={{
      background: "rgba(12, 18, 34, 0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-subtle)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}>
        {/* Brand & Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            onClick={() => setActiveTab("process")}
          >
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #06b6d4 0%, #0369a1 50%, #d97706 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(6, 182, 212, 0.4)",
              position: "relative"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" fill="#ffffff" />
                <path d="M12 3v6" stroke="#ffffff" />
                <path d="M12 15v6" stroke="#ffffff" />
                <path d="M3 12h6" stroke="#ffffff" />
                <path d="M15 12h6" stroke="#ffffff" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: "800", letterSpacing: "-0.03em", color: "#f8fafc" }}>
                  Drums<span style={{ color: "var(--cyan-primary)" }}>OS</span>
                </span>
                <span style={{
                  fontSize: "0.65rem",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "rgba(217, 119, 6, 0.2)",
                  color: "#f59e0b",
                  border: "1px solid rgba(217, 119, 6, 0.4)",
                  fontWeight: "700",
                  letterSpacing: "0.05em"
                }}>
                  TANNERY 4.0
                </span>
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1 }}>
                Leather Processing & Chemical Monitoring OS
              </p>
            </div>
          </div>

          {/* Company Multi-Tenant Dropdown / Creation Switcher */}
          <div style={{ position: "relative", marginLeft: "8px" }}>
            {companies.length === 0 ? (
              <button
                onClick={() => onOpenCompanyModal("create")}
                className="btn btn-leather"
                style={{ fontSize: "0.8rem", padding: "6px 14px" }}
              >
                <Plus size={14} /> Add Company
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowCompanyMenu(!showCompanyMenu);
                  setShowUserMenu(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(24, 35, 63, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  transition: "all 0.2s ease"
                }}
              >
                <Building2 size={15} color="var(--leather-amber)" />
                <span style={{
                  maxWidth: "180px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {activeCompany?.name || "Select Company"}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>
            )}

            {showCompanyMenu && (
              <div style={{
                position: "absolute",
                top: "115%",
                left: 0,
                width: "310px",
                background: "#131d36",
                border: "1px solid var(--border-card)",
                borderRadius: "10px",
                boxShadow: "0 10px 35px rgba(0, 0, 0, 0.6)",
                padding: "8px",
                zIndex: 200,
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  <span>Companies ({companies.length})</span>
                  <button
                    onClick={() => {
                      setShowCompanyMenu(false);
                      onOpenCompanyModal("create");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--cyan-primary)",
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px"
                    }}
                  >
                    <Plus size={12} /> New
                  </button>
                </div>

                <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                  {companies.map((comp) => {
                    const isSelected = comp.id === activeCompany?.id;
                    return (
                      <div
                        key={comp.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          background: isSelected ? "rgba(6, 182, 212, 0.15)" : "transparent",
                          border: isSelected ? "1px solid rgba(6, 182, 212, 0.3)" : "1px solid transparent",
                          marginBottom: "4px",
                          transition: "background 0.15s ease",
                        }}
                        onClick={() => {
                          switchCompany(comp.id);
                          setShowCompanyMenu(false);
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, marginRight: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{
                              fontSize: "0.82rem",
                              fontWeight: "600",
                              color: isSelected ? "var(--cyan-primary)" : "#f8fafc",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {comp.name}
                            </span>
                            <span className="badge badge-amber font-mono" style={{ fontSize: "0.6rem", padding: "0 4px" }}>
                              {comp.code}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                            {comp.location?.split(",")[0] || "Tannery"} • {comp.activeDrumsCount || 0} Drums
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {isSelected && <CheckCircle2 size={14} color="var(--cyan-primary)" />}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCompanyMenu(false);
                              onOpenCompanyModal("edit", comp);
                            }}
                            style={{
                              background: "rgba(255, 255, 255, 0.06)",
                              border: "none",
                              color: "var(--text-secondary)",
                              padding: "4px",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                            title="Edit Company"
                          >
                            <Edit3 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  gap: "6px"
                }}>
                  <button
                    onClick={() => {
                      setShowCompanyMenu(false);
                      onOpenCompanyModal("create");
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: "0.75rem", padding: "6px" }}
                  >
                    <Plus size={13} /> Add Company
                  </button>
                  <button
                    onClick={() => {
                      setShowCompanyMenu(false);
                      onOpenCompanyModal("import");
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "6px 10px" }}
                    title="Upload / Import from JSON"
                  >
                    <Upload size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "rgba(16, 24, 43, 0.6)",
          padding: "4px",
          borderRadius: "10px",
          border: "1px solid var(--border-subtle)",
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 14px",
                  borderRadius: "7px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  background: isActive ? "linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(2, 132, 199, 0.2) 100%)" : "transparent",
                  boxShadow: isActive ? "inset 0 0 0 1px rgba(6, 182, 212, 0.4)" : "none",
                  transition: "all 0.15s ease",
                  position: "relative"
                }}
              >
                <Icon size={16} color={isActive ? "var(--cyan-primary)" : "var(--text-muted)"} />
                <span>{item.label}</span>
                {item.pulse && (
                  <span style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 8px #10b981",
                    display: "inline-block"
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Database Status & User Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Firebase Database Live Sync Badge */}
          <button
            onClick={onOpenFirebaseModal}
            title="Configure / View Firebase Cloud Connection"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: isCustomCloud ? "rgba(16, 185, 129, 0.12)" : "rgba(6, 182, 212, 0.12)",
              border: `1px solid ${isCustomCloud ? "rgba(16, 185, 129, 0.3)" : "rgba(6, 182, 212, 0.3)"}`,
              padding: "6px 12px",
              borderRadius: "8px",
              color: isCustomCloud ? "#34d399" : "#38bdf8",
              cursor: "pointer",
              fontSize: "0.76rem",
              fontWeight: "600",
              transition: "all 0.2s ease"
            }}
          >
            <Database size={14} />
            <span>{isCustomCloud ? "Cloud Firestore Live" : "Firebase DB Ready"}</span>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isCustomCloud ? "#10b981" : "#06b6d4",
              boxShadow: `0 0 8px ${isCustomCloud ? "#10b981" : "#06b6d4"}`
            }} />
          </button>

          {/* User Profile Menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowCompanyMenu(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={currentUser?.name}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--border-card)",
                }}
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#f8fafc", lineHeight: 1.1 }}>
                  {currentUser?.name || "Operator"}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--leather-amber)", textTransform: "capitalize" }}>
                  {currentUser?.roleTitle || currentUser?.role || "Operator"}
                </div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {showUserMenu && (
              <div style={{
                position: "absolute",
                top: "115%",
                right: 0,
                width: "290px",
                background: "#131d36",
                border: "1px solid var(--border-card)",
                borderRadius: "12px",
                boxShadow: "0 12px 35px rgba(0, 0, 0, 0.6)",
                padding: "12px",
                zIndex: 200,
              }}>
                <div style={{
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}>
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        className="form-input"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        autoFocus
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "0.75rem" }}>
                        Save
                      </button>
                    </form>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#f8fafc" }}>
                          {currentUser?.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {currentUser?.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNameInput(currentUser?.name || "");
                          setIsEditingName(true);
                        }}
                        style={{ background: "transparent", border: "none", color: "var(--cyan-primary)", cursor: "pointer", fontSize: "0.7rem" }}
                      >
                        Edit
                      </button>
                    </div>
                  )}

                  <div style={{
                    fontSize: "0.7rem",
                    color: "var(--cyan-primary)",
                    fontWeight: "600",
                    marginTop: "4px"
                  }}>
                    {activeCompany?.name || "No Company Selected"}
                  </div>
                </div>

                {/* Role Switcher */}
                <div style={{ marginTop: "10px" }}>
                  <div style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "6px"
                  }}>
                    Select User Role
                  </div>

                  {userRoles?.map((r) => {
                    const isCurrent = r.id === currentUser?.role;
                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          switchRole(r.id);
                          setShowUserMenu(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          background: isCurrent ? "rgba(6, 182, 212, 0.15)" : "transparent",
                          marginBottom: "4px"
                        }}
                      >
                        <span style={{ fontSize: "0.78rem", fontWeight: "600", color: isCurrent ? "var(--cyan-primary)" : "#f8fafc" }}>
                          {r.title}
                        </span>
                        {isCurrent && <CheckCircle2 size={13} color="var(--cyan-primary)" />}
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  marginTop: "10px",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between"
                }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenFirebaseModal();
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Settings size={13} /> Firebase Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenCompanyModal("manage");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--leather-amber)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Building2 size={13} /> Companies
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
