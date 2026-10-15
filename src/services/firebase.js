// DrumsOS Firebase Database Service
// Supports live Google Cloud Firestore with real-time sync,
// plus seamless offline-first fallback with local storage persistence.

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  setDoc
} from "firebase/firestore";

import {
  INITIAL_PROCESSING_HISTORY,
  INITIAL_DRUMS,
  INITIAL_CHEMICAL_INVENTORY,
  INITIAL_COMPANIES,
  STANDARD_CHEMICAL_CATALOG
} from "../data/tanneryData";

// Bumped storage version to _v2 to ensure any old test mock data is cleaned out
const STORAGE_KEYS = {
  ACTIVITIES: "drumsos_activities_v2",
  DRUMS: "drumsos_drums_v2",
  INVENTORY: "drumsos_inventory_v2",
  COMPANIES: "drumsos_companies_v2",
  FIREBASE_CONFIG: "drumsos_firebase_config_v2",
  MIGRATION_CLEANED: "drumsos_cleaned_v2"
};

// Clean legacy test data on first load if present
function cleanLegacyTestData() {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.MIGRATION_CLEANED)) {
      localStorage.removeItem("drumsos_activities_v1");
      localStorage.removeItem("drumsos_drums_v1");
      localStorage.removeItem("drumsos_inventory_v1");
      localStorage.removeItem("drumsos_companies_v1");
      localStorage.removeItem("drumsos_current_user_v1");
      localStorage.setItem(STORAGE_KEYS.MIGRATION_CLEANED, "true");
    }
  } catch (err) {
    console.error("Migration cleanup error:", err);
  }
}
cleanLegacyTestData();

// Default Demo Firebase Config placeholder (can be overwritten via UI)
const DEFAULT_DEMO_CONFIG = {
  apiKey: "AIzaSyDemoKeyDrumsOsTanneryProduction2026",
  authDomain: "drumsos-tannery-suite.firebaseapp.com",
  projectId: "drumsos-tannery-suite",
  storageBucket: "drumsos-tannery-suite.appspot.com",
  messagingSenderId: "982736412093",
  appId: "1:982736412093:web:a1b2c3d4e5f6g7h8i9j0"
};

let firebaseApp = null;
let firestoreDb = null;
let isLiveFirestoreActive = false;

// Initialize Firebase with fallback handling
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Failed to read Firebase config from localStorage", err);
  }
  return DEFAULT_DEMO_CONFIG;
}

export function isCustomFirebaseConfigured() {
  const config = getFirebaseConfig();
  return config && config.apiKey && !config.apiKey.includes("DemoKey");
}

export function initFirebaseService() {
  const config = getFirebaseConfig();
  
  if (config && config.apiKey && !config.apiKey.includes("DemoKey")) {
    try {
      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApp();
      }
      firestoreDb = getFirestore(firebaseApp);
      isLiveFirestoreActive = true;
      console.log("DrumsOS: Connected to Live Firebase Firestore project:", config.projectId);
      return { success: true, mode: "live_cloud", projectId: config.projectId };
    } catch (err) {
      console.warn("DrumsOS: Error connecting to live Firebase, switching to resilient local sync:", err);
      isLiveFirestoreActive = false;
      return { success: false, mode: "local_sync", error: err.message };
    }
  }

  isLiveFirestoreActive = false;
  return { success: true, mode: "local_sync", projectId: config?.projectId || "drumsos-sandbox" };
}

// ==========================================
// 1. COMPANIES MANAGEMENT (CRUD & FIREBASE)
// ==========================================

export function getLocalCompanies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(INITIAL_COMPANIES));
  return INITIAL_COMPANIES;
}

export function saveLocalCompanies(companies) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  } catch (e) {
    console.error("Failed to save companies locally", e);
  }
}

export async function createCompany(companyData) {
  const newCompany = {
    ...companyData,
    id: companyData.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    code: (companyData.code || companyData.name.slice(0, 3)).toUpperCase().trim(),
    name: companyData.name.trim(),
    location: companyData.location || "Tannery Sector",
    certifications: Array.isArray(companyData.certifications)
      ? companyData.certifications
      : (companyData.certifications ? companyData.certifications.split(",").map(c => c.trim()) : ["ISO 9001"]),
    dailyCapacityHides: Number(companyData.dailyCapacityHides) || 1000,
    establishedYear: Number(companyData.establishedYear) || new Date().getFullYear(),
    activeDrumsCount: 0,
    createdAt: new Date().toISOString()
  };

  const companies = getLocalCompanies();
  const updated = [newCompany, ...companies];
  saveLocalCompanies(updated);

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, "companies", newCompany.id), newCompany);
    } catch (err) {
      console.warn("Failed to sync new company to Firestore:", err);
    }
  }

  return newCompany;
}

export async function updateCompany(companyId, updateData) {
  const companies = getLocalCompanies();
  const updated = companies.map((c) => {
    if (c.id === companyId) {
      return {
        ...c,
        ...updateData,
        code: (updateData.code || c.code).toUpperCase().trim(),
        certifications: Array.isArray(updateData.certifications)
          ? updateData.certifications
          : (typeof updateData.certifications === "string" ? updateData.certifications.split(",").map(s => s.trim()) : c.certifications),
        updatedAt: new Date().toISOString()
      };
    }
    return c;
  });

  saveLocalCompanies(updated);

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, "companies", companyId), updateData);
    } catch (err) {
      console.warn("Failed to update company in Firestore:", err);
    }
  }

  return updated.find(c => c.id === companyId);
}

export async function deleteCompany(companyId) {
  const companies = getLocalCompanies();
  const updatedCompanies = companies.filter(c => c.id !== companyId);
  saveLocalCompanies(updatedCompanies);

  // Also remove drums belonging to this company
  const drums = getLocalDrums();
  const updatedDrums = drums.filter(d => d.companyId !== companyId);
  saveLocalDrums(updatedDrums);

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "companies", companyId));
    } catch (err) {
      console.warn("Failed to delete company from Firestore:", err);
    }
  }

  return true;
}

// ==========================================
// 2. DRUMS MANAGEMENT (CRUD & FIREBASE)
// ==========================================

export function getLocalDrums() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRUMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.DRUMS, JSON.stringify(INITIAL_DRUMS));
  return INITIAL_DRUMS;
}

export function saveLocalDrums(drums) {
  try {
    localStorage.setItem(STORAGE_KEYS.DRUMS, JSON.stringify(drums));
  } catch (e) {
    console.error("Failed to save drums locally", e);
  }
}

export async function createDrum(drumData) {
  const newDrum = {
    ...drumData,
    id: drumData.id || `drum_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    drumNumber: drumData.drumNumber || "Drum #01",
    name: drumData.name || drumData.drumNumber || "Drum #01",
    type: drumData.type || "Stainless Steel Milling Drum",
    capacityLiters: Number(drumData.capacityLiters) || 6000,
    maxLoadKg: Number(drumData.maxLoadKg) || 2000,
    diameterMeters: Number(drumData.diameterMeters) || 3.0,
    widthMeters: Number(drumData.widthMeters) || 2.5,
    maxRpm: Number(drumData.maxRpm) || 16,
    currentRpm: 0,
    status: "Idle",
    currentLeather: "Unassigned",
    currentStep: "Ready for Loading",
    currentTempC: 25.0,
    currentPh: 7.0,
    batchWeightKg: 0,
    lotNumber: "UNASSIGNED",
    lastOperator: "N/A",
    rotationDirection: "Stationary",
    createdAt: new Date().toISOString()
  };

  const drums = getLocalDrums();
  const updated = [newDrum, ...drums];
  saveLocalDrums(updated);

  // Update company drum count
  const companies = getLocalCompanies();
  const updatedCompanies = companies.map(c => {
    if (c.id === newDrum.companyId) {
      return { ...c, activeDrumsCount: (c.activeDrumsCount || 0) + 1 };
    }
    return c;
  });
  saveLocalCompanies(updatedCompanies);

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, "drums", newDrum.id), newDrum);
    } catch (err) {
      console.warn("Failed to sync new drum to Firestore:", err);
    }
  }

  return newDrum;
}

export async function updateDrum(drumId, updateData) {
  const drums = getLocalDrums();
  const updated = drums.map(d => (d.id === drumId ? { ...d, ...updateData } : d));
  saveLocalDrums(updated);

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, "drums", drumId), updateData);
    } catch (err) {
      console.warn("Failed to update drum in Firestore:", err);
    }
  }

  return updated.find(d => d.id === drumId);
}

export async function deleteDrum(drumId) {
  const drums = getLocalDrums();
  const targetDrum = drums.find(d => d.id === drumId);
  const updated = drums.filter(d => d.id !== drumId);
  saveLocalDrums(updated);

  if (targetDrum) {
    const companies = getLocalCompanies();
    const updatedCompanies = companies.map(c => {
      if (c.id === targetDrum.companyId) {
        return { ...c, activeDrumsCount: Math.max(0, (c.activeDrumsCount || 1) - 1) };
      }
      return c;
    });
    saveLocalCompanies(updatedCompanies);
  }

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "drums", drumId));
    } catch (err) {
      console.warn("Failed to delete drum from Firestore:", err);
    }
  }

  return true;
}

export async function updateDrumTelemetry(drumId, telemetryData) {
  const drums = getLocalDrums();
  const updated = drums.map((d) => (d.id === drumId ? { ...d, ...telemetryData } : d));
  saveLocalDrums(updated);

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      const drumRef = doc(firestoreDb, "drums", drumId);
      await updateDoc(drumRef, telemetryData);
    } catch (err) {
      // offline fallback
    }
  }
  return updated.find((d) => d.id === drumId);
}

// ==========================================
// 3. CHEMICAL INVENTORY (CRUD & FIREBASE)
// ==========================================

export function getLocalInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_CHEMICAL_INVENTORY));
  return INITIAL_CHEMICAL_INVENTORY;
}

export function saveLocalInventory(inventory) {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  } catch (e) {
    console.error("Failed to save inventory locally", e);
  }
}

export async function createChemical(chemicalData) {
  const newChemical = {
    ...chemicalData,
    id: chemicalData.id || `chem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: chemicalData.name.trim(),
    code: (chemicalData.code || "CHEM").toUpperCase().trim(),
    category: chemicalData.category || "Tanning Agent",
    currentStockKg: Number(chemicalData.currentStockKg) || 0,
    minStockKg: Number(chemicalData.minStockKg) || 500,
    unitPriceUsd: Number(chemicalData.unitPriceUsd) || 1.0,
    location: chemicalData.location || "Chemical Storage",
    createdAt: new Date().toISOString()
  };

  const inventory = getLocalInventory();
  const updated = [newChemical, ...inventory];
  saveLocalInventory(updated);

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, "inventory", newChemical.id), newChemical);
    } catch (err) {
      console.warn("Failed to sync chemical to Firestore:", err);
    }
  }

  return newChemical;
}

export async function updateChemical(chemicalId, updateData) {
  const inventory = getLocalInventory();
  const updated = inventory.map(item => (item.id === chemicalId ? { ...item, ...updateData } : item));
  saveLocalInventory(updated);

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, "inventory", chemicalId), updateData);
    } catch (err) {
      console.warn("Failed to update chemical in Firestore:", err);
    }
  }

  return updated.find(item => item.id === chemicalId);
}

export async function deleteChemical(chemicalId) {
  const inventory = getLocalInventory();
  const updated = inventory.filter(item => item.id !== chemicalId);
  saveLocalInventory(updated);

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "inventory", chemicalId));
    } catch (err) {
      console.warn("Failed to delete chemical from Firestore:", err);
    }
  }

  return true;
}

export function loadStandardChemicalCatalog(defaultStockKg = 0) {
  const templateWithStock = STANDARD_CHEMICAL_CATALOG.map(item => ({
    ...item,
    currentStockKg: defaultStockKg,
    id: `inv_${item.code.toLowerCase().replace(/[^a-z0-9]/g, "_")}`
  }));
  saveLocalInventory(templateWithStock);
  return templateWithStock;
}

// ==========================================
// 4. ACTIVITIES MANAGEMENT (SAVE & QUERY)
// ==========================================

export function getLocalActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_PROCESSING_HISTORY));
  return INITIAL_PROCESSING_HISTORY;
}

export function saveLocalActivities(activities) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error("Failed to save activities locally", e);
  }
}

export async function saveProcessingActivity(activityData) {
  const timestamp = new Date().toISOString();
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(new Date());

  const recordPayload = {
    ...activityData,
    id: activityData.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recordedAt: timestamp,
    formattedDate: formattedDate,
    syncedToFirebase: isLiveFirestoreActive,
    clientSavedAt: Date.now()
  };

  let savedRecord = { ...recordPayload };

  if (isLiveFirestoreActive && firestoreDb) {
    try {
      const colRef = collection(firestoreDb, "drum_processing_activities");
      const docRef = await addDoc(colRef, {
        ...recordPayload,
        serverTimestamp: serverTimestamp()
      });
      savedRecord.firestoreId = docRef.id;
      savedRecord.syncedToFirebase = true;
      console.log("DrumsOS: Activity successfully saved to Firestore with ID:", docRef.id);
    } catch (err) {
      console.warn("DrumsOS: Live Firestore write failed, saving to persistent local store:", err);
      savedRecord.syncedToFirebase = false;
      savedRecord.syncError = err.message;
    }
  }

  const currentActivities = getLocalActivities();
  const updatedActivities = [savedRecord, ...currentActivities];
  saveLocalActivities(updatedActivities);

  // Update drum current status and last activity
  try {
    const drums = getLocalDrums();
    const updatedDrums = drums.map((drum) => {
      if (drum.id === activityData.drumId || (drum.drumNumber === activityData.drumNumber && drum.companyId === activityData.companyId)) {
        return {
          ...drum,
          currentStep: activityData.stepName,
          currentLeather: activityData.leatherTypeName,
          batchWeightKg: activityData.batchWeightKg || drum.batchWeightKg,
          lotNumber: activityData.lotNumber || drum.lotNumber,
          currentTempC: activityData.floatTempC || drum.currentTempC,
          currentPh: activityData.floatPh || drum.currentPh,
          currentRpm: activityData.drumRpm !== undefined ? activityData.drumRpm : drum.currentRpm,
          lastOperator: activityData.operatorName || drum.lastOperator,
          lastUpdated: timestamp,
          status: activityData.status || "Active"
        };
      }
      return drum;
    });
    saveLocalDrums(updatedDrums);
  } catch (err) {
    console.error("Failed to update drum status:", err);
  }

  // Deduct chemical consumption from inventory if items match
  try {
    if (activityData.chemicalsUsed && Array.isArray(activityData.chemicalsUsed)) {
      const inventory = getLocalInventory();
      if (inventory.length > 0) {
        const updatedInventory = inventory.map((item) => {
          const usedChem = activityData.chemicalsUsed.find(
            (c) => c.name?.toLowerCase().includes(item.name.toLowerCase().slice(0, 10)) ||
                   item.code?.toLowerCase() === c.code?.toLowerCase()
          );
          if (usedChem && usedChem.actualKg) {
            const newStock = Math.max(0, item.currentStockKg - Number(usedChem.actualKg));
            return { ...item, currentStockKg: Number(newStock.toFixed(2)) };
          }
          return item;
        });
        saveLocalInventory(updatedInventory);
      }
    }
  } catch (err) {
    console.error("Failed to update chemical inventory:", err);
  }

  return savedRecord;
}

export async function fetchProcessingActivities(companyId = null) {
  if (isLiveFirestoreActive && firestoreDb) {
    try {
      const colRef = collection(firestoreDb, "drum_processing_activities");
      let q;
      if (companyId && companyId !== "all") {
        q = query(colRef, where("companyId", "==", companyId), orderBy("recordedAt", "desc"));
      } else {
        q = query(colRef, orderBy("recordedAt", "desc"));
      }
      const snapshot = await getDocs(q);
      const cloudRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (cloudRecords.length > 0) {
        return cloudRecords;
      }
    } catch (err) {
      console.warn("Could not fetch from live Firestore, falling back to local database:", err.message);
    }
  }

  const all = getLocalActivities();
  if (companyId && companyId !== "all") {
    return all.filter((act) => act.companyId === companyId);
  }
  return all;
}

export async function deleteProcessingActivity(activityId) {
  if (isLiveFirestoreActive && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "drum_processing_activities", activityId));
    } catch (err) {
      console.warn("Failed to delete from Firestore:", err.message);
    }
  }
  const current = getLocalActivities();
  const updated = current.filter((act) => act.id !== activityId);
  saveLocalActivities(updated);
  return true;
}

// ==========================================
// 5. IMPORT / EXPORT & DATA RESET
// ==========================================

export function importTanneryData({ companies, drums, inventory, activities }) {
  if (Array.isArray(companies)) {
    saveLocalCompanies(companies);
  }
  if (Array.isArray(drums)) {
    saveLocalDrums(drums);
  }
  if (Array.isArray(inventory)) {
    saveLocalInventory(inventory);
  }
  if (Array.isArray(activities)) {
    saveLocalActivities(activities);
  }
  return { success: true };
}

export function exportTanneryData() {
  return {
    exportDate: new Date().toISOString(),
    version: "2.0",
    companies: getLocalCompanies(),
    drums: getLocalDrums(),
    inventory: getLocalInventory(),
    activities: getLocalActivities()
  };
}

export function clearAllTanneryData() {
  saveLocalActivities([]);
  saveLocalDrums([]);
  saveLocalInventory([]);
  saveLocalCompanies([]);
}

export const resetTanneryDataToDefaults = clearAllTanneryData;

export function saveFirebaseCredentials(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
    return initFirebaseService();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function resetFirebaseToSandbox() {
  try {
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
    return initFirebaseService();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
