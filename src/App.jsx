import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HierarchicalSelector from "./components/HierarchicalSelector";
import ProcessFlowViewer from "./components/ProcessFlowViewer";
import DrumMonitoringFloor from "./components/DrumMonitoringFloor";
import OperationHistory from "./components/OperationHistory";
import ChemicalInventory from "./components/ChemicalInventory";
import ProductionReports from "./components/ProductionReports";
import FirebaseConfigModal from "./components/FirebaseConfigModal";
import CompanyModal from "./components/CompanyModal";
import DrumModal from "./components/DrumModal";

import {
  fetchProcessingActivities,
  getLocalDrums,
  getLocalInventory,
  getLocalCompanies,
  initFirebaseService
} from "./services/firebase";
import { LEATHER_TYPES } from "./data/tanneryData";

function MainDashboard() {
  const { currentUser, activeCompany, companies, switchCompany, reloadCompanies } = useAuth();

  // Navigation tab: 'process', 'floor', 'history', 'inventory', 'reports'
  const [activeTab, setActiveTab] = useState("process");

  // Selection states for Hierarchical Selector
  const [selectedCompanyId, setSelectedCompanyId] = useState(activeCompany?.id || companies[0]?.id || "");
  const [drums, setDrums] = useState(() => getLocalDrums());
  
  // Drums belonging to currently selected company
  const companyDrums = drums.filter((d) => d.companyId === selectedCompanyId);
  const [selectedDrumId, setSelectedDrumId] = useState(companyDrums[0]?.id || "");
  
  // Leather Type
  const [selectedLeatherId, setSelectedLeatherId] = useState(LEATHER_TYPES[0].id);
  const activeLeather = LEATHER_TYPES.find((l) => l.id === selectedLeatherId) || LEATHER_TYPES[0];

  // Batch Parameters
  const [batchWeightKg, setBatchWeightKg] = useState(activeLeather.defaultBatchWeightKg || 1500);
  const [lotNumber, setLotNumber] = useState(`LOT-2026-001`);

  // Data states
  const [activities, setActivities] = useState([]);
  const [inventory, setInventory] = useState(() => getLocalInventory());
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Company Modal State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyModalMode, setCompanyModalMode] = useState("manage"); // 'create', 'edit', 'manage', 'import'
  const [companyToEdit, setCompanyToEdit] = useState(null);

  // Drum Modal State
  const [isDrumModalOpen, setIsDrumModalOpen] = useState(false);
  const [drumToEdit, setDrumToEdit] = useState(null);

  // Initialize Firebase and load initial records
  useEffect(() => {
    initFirebaseService();
    loadActivities();
  }, []);

  // Sync selected company if active company from auth changes
  useEffect(() => {
    if (activeCompany && activeCompany.id !== selectedCompanyId) {
      setSelectedCompanyId(activeCompany.id);
    } else if (!selectedCompanyId && companies.length > 0) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [activeCompany, companies]);

  // When selectedCompanyId changes, update selected drum and lot number
  useEffect(() => {
    const currentCompDrums = drums.filter((d) => d.companyId === selectedCompanyId);
    if (currentCompDrums.length > 0) {
      if (!currentCompDrums.some(d => d.id === selectedDrumId)) {
        setSelectedDrumId(currentCompDrums[0].id);
      }
    } else {
      setSelectedDrumId("");
    }
    const currentComp = companies.find((c) => c.id === selectedCompanyId);
    if (currentComp) {
      setLotNumber(`LOT-${currentComp.code}-2026-${Math.floor(100 + Math.random() * 50)}`);
    }
  }, [selectedCompanyId, drums, companies]);

  // When leather type changes, update default batch weight
  const handleSelectLeather = (leatherId) => {
    setSelectedLeatherId(leatherId);
    const found = LEATHER_TYPES.find((l) => l.id === leatherId);
    if (found) {
      setBatchWeightKg(found.defaultBatchWeightKg);
    }
  };

  const loadActivities = async () => {
    try {
      const data = await fetchProcessingActivities();
      setActivities(data);
    } catch (err) {
      console.error("Failed to load activities", err);
    }
  };

  const handleActivitySaved = (newActivity) => {
    loadActivities();
    setDrums(getLocalDrums());
    setInventory(getLocalInventory());
  };

  const handleSelectDrumForProcess = (drum) => {
    setSelectedCompanyId(drum.companyId);
    setSelectedDrumId(drum.id);
    if (drum.currentLeather) {
      const match = LEATHER_TYPES.find((l) => l.name === drum.currentLeather);
      if (match) setSelectedLeatherId(match.id);
    }
    if (drum.batchWeightKg) {
      setBatchWeightKg(drum.batchWeightKg);
    }
    setActiveTab("process");
  };

  // Company Modal Triggers
  const handleOpenCompanyModal = (mode = "manage", company = null) => {
    setCompanyModalMode(mode);
    setCompanyToEdit(company);
    setIsCompanyModalOpen(true);
  };

  const handleCompanyCreated = (newCompany) => {
    const updatedCompanies = reloadCompanies();
    if (newCompany?.id) {
      setSelectedCompanyId(newCompany.id);
      switchCompany(newCompany.id);
    }
    setDrums(getLocalDrums());
  };

  const handleCompanyUpdated = (updatedCompany) => {
    reloadCompanies();
    if (updatedCompany?.id === selectedCompanyId) {
      switchCompany(updatedCompany.id);
    }
  };

  const handleCompanyDeleted = (deletedId) => {
    const remaining = reloadCompanies();
    if (remaining.length > 0) {
      setSelectedCompanyId(remaining[0].id);
      switchCompany(remaining[0].id);
    } else {
      setSelectedCompanyId("");
    }
    setDrums(getLocalDrums());
  };

  // Drum Modal Triggers
  const handleOpenDrumModal = (drum = null) => {
    setDrumToEdit(drum);
    setIsDrumModalOpen(true);
  };

  const handleDrumSaved = (savedDrum) => {
    const updatedDrums = getLocalDrums();
    setDrums(updatedDrums);
    if (savedDrum?.id) {
      setSelectedDrumId(savedDrum.id);
    }
    reloadCompanies();
  };

  const handleDrumDeleted = (deletedId) => {
    const updatedDrums = getLocalDrums();
    setDrums(updatedDrums);
    const compDrums = updatedDrums.filter(d => d.companyId === selectedCompanyId);
    setSelectedDrumId(compDrums[0]?.id || "");
    reloadCompanies();
  };

  // Target drum object
  const activeDrum = companyDrums.find((d) => d.id === selectedDrumId) || companyDrums[0] || null;
  const activeCompanyObj = companies.find((c) => c.id === selectedCompanyId) || activeCompany || null;

  return (
    <div className="drumsos-layout">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenCompanyModal={handleOpenCompanyModal}
      />

      {/* Main Content Area */}
      <main className="drumsos-main">
        {/* TAB 1: Process & Operations (Core Requirement) */}
        {activeTab === "process" && (
          <div>
            {/* Hierarchical Selection System */}
            <HierarchicalSelector
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={(id) => {
                setSelectedCompanyId(id);
                switchCompany(id);
              }}
              drums={drums}
              selectedDrumId={selectedDrumId}
              onSelectDrum={setSelectedDrumId}
              selectedLeatherId={selectedLeatherId}
              onSelectLeather={handleSelectLeather}
              batchWeightKg={batchWeightKg}
              onChangeBatchWeight={setBatchWeightKg}
              lotNumber={lotNumber}
              onChangeLotNumber={setLotNumber}
              onOpenCompanyModal={handleOpenCompanyModal}
              onOpenDrumModal={handleOpenDrumModal}
            />

            {/* Predefined Steps, Chemicals, and Firebase Logging */}
            {activeCompanyObj && activeLeather && (
              <ProcessFlowViewer
                company={activeCompanyObj}
                drum={activeDrum}
                leather={activeLeather}
                batchWeightKg={batchWeightKg}
                lotNumber={lotNumber}
                onActivitySaved={handleActivitySaved}
              />
            )}
          </div>
        )}

        {/* TAB 2: Live Drum Floor Monitoring */}
        {activeTab === "floor" && (
          <DrumMonitoringFloor
            drums={drums}
            companies={companies}
            selectedCompanyId={selectedCompanyId}
            onSelectDrumForProcess={handleSelectDrumForProcess}
            onDrumsUpdated={() => setDrums(getLocalDrums())}
            onOpenDrumModal={handleOpenDrumModal}
          />
        )}

        {/* TAB 3: Operations History & Audit Log */}
        {activeTab === "history" && (
          <OperationHistory
            activities={activities}
            companies={companies}
            onRefreshHistory={loadActivities}
          />
        )}

        {/* TAB 4: Chemical Inventory Tracking */}
        {activeTab === "inventory" && (
          <ChemicalInventory
            inventory={inventory}
            onInventoryUpdated={() => setInventory(getLocalInventory())}
          />
        )}

        {/* TAB 5: Production Reports */}
        {activeTab === "reports" && (
          <ProductionReports
            activities={activities}
            drums={drums}
            companies={companies}
          />
        )}
      </main>

      {/* Company Management & JSON Import Modal */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        onCompanyCreated={handleCompanyCreated}
        onCompanyUpdated={handleCompanyUpdated}
        onCompanyDeleted={handleCompanyDeleted}
        mode={companyModalMode}
        editingCompany={companyToEdit}
      />

      {/* Drum Management Modal */}
      <DrumModal
        isOpen={isDrumModalOpen}
        onClose={() => setIsDrumModalOpen(false)}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        drumToEdit={drumToEdit}
        onDrumSaved={handleDrumSaved}
        onDrumDeleted={handleDrumDeleted}
      />

      {/* Firebase Cloud & Sandbox Configuration Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConfigUpdated={() => {
          loadActivities();
          setDrums(getLocalDrums());
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
