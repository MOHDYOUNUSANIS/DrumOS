# DrumsOS — Tannery & Leather Drum Processing Operating System

![DrumsOS Banner](https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80)

**DrumsOS** is a modern, responsive, and secure web application engineered specifically for leather factories, tanneries, and wet-end processing plants to monitor, manage, and record drum operations across multiple companies.

---

## 🌟 Key Features

### 🏢 1. Multi-Company & Tenant Management
- **Full Company CRUD**: Create, edit, and delete tannery company profiles on the fly.
- **Entity Metadata**: Record factory location, environmental ratings (e.g., LWG Gold/Silver, ISO 14001, ZDHC, REACH), and daily hide capacity.
- **JSON Import / Export**: Bulk upload actual company and drum data from JSON files or download sample templates.
- **Tenant Isolation**: Seamless switching between companies with filtered drum floors and activity history.

### 🔄 2. Hierarchical Dropdown Selection System
1. **Step 1: Company Selection** — Select or create the operating tannery entity.
2. **Step 2: Drum Vessel Selection** — Select specific drums assigned to the company, or register new drums with volume, diameter, and RPM limits.
3. **Step 3: Leather Grade & Tannage** — Automatically loads industrial tannage specifications:
   - Full Grain Bovine Shoe Upper (Chrome Tanned Wet-Blue)
   - Chrome-Free Vegetable Tanned Cowhide (Mimosa, Quebracho, Chestnut)
   - Nappa Garment Sheepskin (Soft Drape Glove Semi-Chrome)
   - Heavy Buffalo Sole Leather (High-Density Condensed Tannin)
   - Nubuck & Suede Cowhide (Tight-Grain Snuffed / Re-tanned)
   - Water-Resistant Wet-White Automotive (Zero-Chrome Syntans)
4. **Dynamic Batch Calculations** — Enter pelt/shaved load weight (kg) to instantly calculate required chemical dosages.

### 🧪 3. Predefined Chemical Recipes & Step Pipelines
- Sequenced tannery phases: **Beamhouse**, **Tanyard**, **Post-Tanning Wet-End**, and **Finishing**.
- Operational parameters: float percentage, bath temperature (°C), target pH range, recommended RPM, run duration, and hazard/safety instructions.
- Chemical dosage tables: prescribed vs. actual added kilograms, lot tracking, and scale verification.

### ☁️ 4. Direct Firebase Database Integration
- Direct synchronization with Google Cloud Firestore (`drum_processing_activities` collection).
- Complete operational schema: Company, Drum, Leather Type, Step, Physical Float Readings (pH, Temp, RPM, Duration), itemized chemical breakdown, operator signature, and accurate ISO timestamp.
- Resilient offline-first fallback with persistent local sync.
- Real-time chemical warehouse inventory deduction upon batch completion.

### 📊 5. Monitoring & Operational Intelligence
- **Live Drum Floor**: Animated rotating drum cylinders reflecting motor RPM, live sensor telemetry cards, and quick start/stop/speed controls.
- **Operations History**: Searchable, filterable audit log by company, drum, leather, and QC status. Detailed chemical dosage receipts, CSV export, and print-ready Tannery Run Sheets.
- **Chemical Inventory**: Real-time warehouse tracking, safety stock threshold alerts, inventory valuation, and restock management.
- **Production Reports**: Executive throughput metrics, chemical dosage ratios (kg/ton), and vessel load utilization matrices.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React.js](https://react.dev/) + [Vite](https://vite.dev/)
- **Icons & UI Assets**: [Lucide React](https://lucide.dev/)
- **Database / Cloud**: [Firebase](https://firebase.google.com/) (Firestore) + Offline-first Local Storage
- **Effects**: Canvas Confetti
- **Typography**: Plus Jakarta Sans & JetBrains Mono (Google Fonts)
- **Styling**: Modern Industrial Dark Theme CSS Design System

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Rockplayer0651/DrumsOs.git
   cd DrumsOs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

---

## ⚙️ Firebase Cloud Configuration

To connect DrumsOS to your live Google Cloud Firebase project:
1. Click the **Firebase DB Ready / Cloud Firestore Live** badge in the top navigation bar.
2. Enter your Firebase project credentials (`apiKey`, `projectId`, `authDomain`, `storageBucket`, `appId`).
3. Click **Save & Sync**. Activities will now sync directly to your live Firestore database!

---

## 📄 License

This project is licensed under the MIT License.
