import React, { createContext, useContext, useState, useEffect } from "react";
import { DEMO_USERS, USER_ROLES } from "../data/tanneryData";
import { getLocalCompanies } from "../services/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [companies, setCompanies] = useState(() => {
    return getLocalCompanies();
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("drumsos_current_user_v2");
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.error(e);
    }
    return {
      id: "usr_operator_01",
      name: "Tannery Operator",
      email: "operator@tannery.cloud",
      role: "operator",
      roleTitle: "Senior Wet-End Operator",
      companyId: companies[0]?.id || "",
      companyName: companies[0]?.name || "Select Company",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      badge: "Certified Drummer"
    };
  });

  // Active company derived from selection or first available
  const activeCompany = companies.find((c) => c.id === currentUser?.companyId) || companies[0] || null;

  // Keep company name in user profile synchronized
  useEffect(() => {
    if (activeCompany && currentUser?.companyId !== activeCompany.id) {
      setCurrentUser((prev) => ({
        ...prev,
        companyId: activeCompany.id,
        companyName: activeCompany.name
      }));
    }
  }, [activeCompany]);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem("drumsos_current_user_v2", JSON.stringify(currentUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  const reloadCompanies = () => {
    const loaded = getLocalCompanies();
    setCompanies(loaded);
    return loaded;
  };

  const switchCompany = (companyId) => {
    const targetComp = companies.find((c) => c.id === companyId);
    if (!targetComp) return;

    setCurrentUser((prev) => ({
      ...prev,
      companyId: targetComp.id,
      companyName: targetComp.name
    }));
  };

  const switchRole = (roleId) => {
    const roleDef = USER_ROLES.find((r) => r.id === roleId);
    if (!roleDef) return;

    setCurrentUser((prev) => ({
      ...prev,
      role: roleDef.id,
      roleTitle: roleDef.title,
      badge: roleDef.badge
    }));
  };

  const updateProfileName = (newName) => {
    setCurrentUser((prev) => ({
      ...prev,
      name: newName
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeCompany,
        companies,
        setCompanies,
        reloadCompanies,
        switchCompany,
        switchRole,
        updateProfileName,
        userRoles: USER_ROLES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
