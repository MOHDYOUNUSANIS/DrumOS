// DrumsOS - Leather Tannery & Drum Processing Domain Data

// Initial Companies - Empty by default (User creates or uploads actual companies)
export const INITIAL_COMPANIES = [];

// Initial Drums - Empty by default (User creates or uploads actual drums per company)
export const INITIAL_DRUMS = [];

// Standard Leather Types and Tannage Specifications (Predefined specifications)
export const LEATHER_TYPES = [
  {
    id: "full_grain_bovine",
    name: "Full Grain Bovine Shoe Upper",
    category: "Footwear & Boots",
    rawMaterial: "Cow / Steer Hides (Flayed Wet Salted)",
    targetThicknessMm: "1.8 - 2.0 mm",
    tannageType: "Chrome Tanned (Wet Blue)",
    description: "Premium high-tensile footwear upper leather with natural grain retention, breathability, and water resistance.",
    defaultBatchWeightKg: 1500,
  },
  {
    id: "veg_tanned_cowhide",
    name: "Chrome-Free Vegetable Tanned Cowhide",
    category: "Luxury Bags & Belts",
    rawMaterial: "Heavy Cow Hides (Selected Grain)",
    targetThicknessMm: "2.4 - 2.8 mm",
    tannageType: "Vegetable Tannin (Mimosa / Quebracho / Chestnut)",
    description: "Environmentally certified chrome-free leather known for firm temper, beautiful patina aging, and structural stiffness.",
    defaultBatchWeightKg: 1800,
  },
  {
    id: "nappa_garment_sheep",
    name: "Nappa Garment Sheepskin",
    category: "Fashion Garments & Gloves",
    rawMaterial: "Hairy Sheep / Lamb Pelts",
    targetThicknessMm: "0.7 - 0.9 mm",
    tannageType: "Soft Semi-Chrome / Synthetic Tanned",
    description: "Ultra-supple, drapeable, buttery touch nappa leather engineered for luxury leather jackets, skirts, and designer accessories.",
    defaultBatchWeightKg: 850,
  },
  {
    id: "heavy_buffalo_sole",
    name: "Heavy Buffalo Sole Leather",
    category: "Heavy Duty Outsoles & Saddlery",
    rawMaterial: "Water Buffalo Hides",
    targetThicknessMm: "4.5 - 5.5 mm",
    tannageType: "Heavy Vegetable / Condensed Tannins",
    description: "Extremely high density, abrasion-resistant sole and saddlery leather processed under extended drum cycles.",
    defaultBatchWeightKg: 3200,
  },
  {
    id: "nubuck_suede_cowhide",
    name: "Nubuck & Suede Cowhide",
    category: "Casual Footwear & Handbags",
    rawMaterial: "Full Grain Cowhide (Snuffed / Split)",
    targetThicknessMm: "1.4 - 1.6 mm",
    tannageType: "Chrome / Polymer Re-tanned",
    description: "Fine velvety nap surface created through careful drum fatliquoring, mild buffing, and uniform anionic dye penetration.",
    defaultBatchWeightKg: 1200,
  },
  {
    id: "wet_white_automotive",
    name: "Water-Resistant Wet-White Automotive",
    category: "Automotive Upholstery & Aviation",
    rawMaterial: "European Bovine Hides (Heifer)",
    targetThicknessMm: "1.1 - 1.3 mm",
    tannageType: "Glutaraldehyde / Syntan (Wet-White)",
    description: "Strict low-emission, non-fogging, chrome-free automotive upholstery leather passing stringent UV and heat cycle tests.",
    defaultBatchWeightKg: 1600,
  }
];

// Predefined Leather Processing Steps & Chemical Formulations
export const PROCESSING_STEPS_BY_LEATHER = {
  // 1. FULL GRAIN BOVINE SHOE UPPER
  full_grain_bovine: [
    {
      stepNumber: 1,
      stepId: "step_soak_wash",
      name: "Soaking & Washing",
      phase: "Beamhouse",
      recommendedDurationMins: 240,
      targetFloatPercent: 200,
      targetTempC: 22,
      targetPh: "8.5 - 9.0",
      recommendedRpm: 4,
      safetyInstructions: "Wear eye protection and chemical gloves. Ensure drum exhaust fan is operational.",
      description: "Rehydrate salted raw hides, remove dirt, blood, and soluble globular proteins while relaxing fiber bundles.",
      chemicals: [
        { id: "chem_water", code: "H2O-IND", name: "Industrial Water Float", dosagePercent: 200.0, unit: "% float", hazard: "Safe", function: "Carrier float" },
        { id: "chem_nonionic_surf", code: "TX-100", name: "Non-Ionic Wetting Agent (Surfactant)", dosagePercent: 0.3, unit: "%", hazard: "Irritant", function: "Lowers surface tension for fast penetration" },
        { id: "chem_bactericide", code: "BIO-TAN", name: "Broad Spectrum Tannery Bactericide", dosagePercent: 0.15, unit: "%", hazard: "Toxic", function: "Inhibits microbial decomposition of collagen" },
        { id: "chem_soda_ash", code: "NA2CO3", name: "Sodium Carbonate (Soda Ash)", dosagePercent: 0.4, unit: "%", hazard: "Irritant", function: "Alkaline swelling activator and salt wash" }
      ]
    },
    {
      stepNumber: 2,
      stepId: "step_liming",
      name: "Liming & Unhairing",
      phase: "Beamhouse",
      recommendedDurationMins: 720,
      targetFloatPercent: 120,
      targetTempC: 24,
      targetPh: "12.2 - 12.8",
      recommendedRpm: 3,
      safetyInstructions: "DANGER: High alkaline environment. Hydrogen sulfide gas hazard. Mandatory H2S gas detector active.",
      description: "Hydrolyze hair keratin and mucopolysaccharides, open collagen fiber structure, and disperse interfibrillary proteins.",
      chemicals: [
        { id: "chem_hydrated_lime", code: "CAOH2", name: "Hydrated Calcium Hydroxide (Lime)", dosagePercent: 3.5, unit: "%", hazard: "Corrosive", function: "Fiber opening & swelling of pelt" },
        { id: "chem_sodium_sulfide", code: "NA2S-60", name: "Sodium Sulfide Flakes (60%)", dosagePercent: 1.8, unit: "%", hazard: "Corrosive/Toxic", function: "Hair immunization and keratin dissolving" },
        { id: "chem_sodium_hydrosulfide", code: "NAHS", name: "Sodium Hydrosulfide (NaHS 70%)", dosagePercent: 1.0, unit: "%", hazard: "Corrosive/Toxic", function: "Rapid unhairing without pelt grain burning" },
        { id: "chem_liming_aux", code: "LIME-AUX", name: "Pelt Relaxing Liming Auxiliary", dosagePercent: 0.25, unit: "%", hazard: "Irritant", function: "Prevents draw/wrinkling on grain surface" }
      ]
    },
    {
      stepNumber: 3,
      stepId: "step_deliming_bating",
      name: "Deliming & Bating",
      phase: "Beamhouse / Tanyard",
      recommendedDurationMins: 90,
      targetFloatPercent: 100,
      targetTempC: 34,
      targetPh: "8.0 - 8.3",
      recommendedRpm: 6,
      safetyInstructions: "Check pH with Phenolphthalein indicator slice test on hide cross-section.",
      description: "Remove calcium salts, reduce alkaline swelling, soften pelts, and digest scud/cellular debris using proteolytic enzymes.",
      chemicals: [
        { id: "chem_amm_sulfate", code: "NH4-SO4", name: "Ammonium Sulfate (Technical Grade)", dosagePercent: 2.2, unit: "%", hazard: "Irritant", function: "Gradual deliming and pH reduction" },
        { id: "chem_formic_acid_dl", code: "HCOOH-85", name: "Formic Acid (85% Diluted 1:10)", dosagePercent: 0.5, unit: "%", hazard: "Corrosive", function: "Deep core deliming penetration" },
        { id: "chem_enzymatic_bate", code: "ENZ-1200", name: "Pancreatic Enzymatic Bate (1200 LVU)", dosagePercent: 0.8, unit: "%", hazard: "Harmful", function: "Proteolytic digestion of epidermis debris" }
      ]
    },
    {
      stepNumber: 4,
      stepId: "step_pickling",
      name: "Pickling & Conditioning",
      phase: "Tanyard",
      recommendedDurationMins: 120,
      targetFloatPercent: 60,
      targetTempC: 22,
      targetPh: "2.8 - 3.0",
      recommendedRpm: 8,
      safetyInstructions: "CRITICAL: Always verify Baumé hydrometer reaches 7° Bé BEFORE adding acid to prevent acid swelling shock.",
      description: "Acidify the collagen matrix to dehydrate pelts and prepare reactive amino groups for chromium cation bonding.",
      chemicals: [
        { id: "chem_salt", code: "NACL-IND", name: "Refined Vacuum Salt (NaCl)", dosagePercent: 6.5, unit: "%", hazard: "Safe", function: "Suppresses acid osmotic swelling (>7° Bé)" },
        { id: "chem_formic_acid", code: "HCOOH-85", name: "Formic Acid (85% commercial)", dosagePercent: 0.8, unit: "%", hazard: "Corrosive", function: "Penetrating acid buffering" },
        { id: "chem_sulfuric_acid", code: "H2SO4-98", name: "Sulfuric Acid (Concentrated 98% diluted 1:15)", dosagePercent: 1.2, unit: "%", hazard: "Corrosive", function: "Core acidification down to pH 2.8" },
        { id: "chem_fungicide", code: "FUNG-WB", name: "TCMTB Leather Fungicide / Anti-Mildew", dosagePercent: 0.12, unit: "%", hazard: "Toxic", function: "Wet-Blue storage preservation" }
      ]
    },
    {
      stepNumber: 5,
      stepId: "step_chrome_tanning",
      name: "Chrome Tanning (Wet-Blue)",
      phase: "Tanyard",
      recommendedDurationMins: 360,
      targetFloatPercent: 80,
      targetTempC: 38,
      targetPh: "3.8 - 4.0",
      recommendedRpm: 10,
      safetyInstructions: "Boil test on tanned hide piece must withstand > 100°C for 2 minutes without shrinkage before unloading.",
      description: "Cross-link collagen polypeptide chains with chromium (III) complexes to achieve thermal stability and rot resistance.",
      chemicals: [
        { id: "chem_bcs", code: "CR2-SO4", name: "Basic Chromium Sulfate (33% Basicity, 25% Cr2O3)", dosagePercent: 6.0, unit: "%", hazard: "Harmful", function: "Primary mineral tanning cross-linking agent" },
        { id: "chem_sodium_formate", code: "HCOONA", name: "Sodium Formate Masking Salt", dosagePercent: 0.7, unit: "%", hazard: "Safe", function: "Masks chromium complex for even penetration" },
        { id: "chem_magnesium_oxide", code: "MGO-BAS", name: "Magnesium Oxide Self-Basifying Agent", dosagePercent: 0.45, unit: "%", hazard: "Irritant", function: "Slow controlled basification to pH 3.8-4.0" }
      ]
    },
    {
      stepNumber: 6,
      stepId: "step_neutralization",
      name: "Neutralization",
      phase: "Post-Tanning (Wet-End)",
      recommendedDurationMins: 60,
      targetFloatPercent: 150,
      targetTempC: 35,
      targetPh: "4.8 - 5.2",
      recommendedRpm: 8,
      safetyInstructions: "Bromocresol green indicator cut must show blue/green uniform tint across 70% cross section.",
      description: "Deprotonate amino groups in shaved wet-blue leather to allow deeper penetration of subsequent anionic retanning agents and dyes.",
      chemicals: [
        { id: "chem_sod_bicarb", code: "NAHCO3", name: "Sodium Bicarbonate (Food Grade)", dosagePercent: 1.2, unit: "%", hazard: "Safe", function: "Mild de-acidification" },
        { id: "chem_neut_syntan", code: "NEUT-SYN", name: "Sulfonated Aromatic Neutralizing Syntan", dosagePercent: 2.0, unit: "%", hazard: "Irritant", function: "Grain-buffering and even charge distribution" }
      ]
    },
    {
      stepNumber: 7,
      stepId: "step_retanning_filling",
      name: "Retanning & Filling",
      phase: "Post-Tanning (Wet-End)",
      recommendedDurationMins: 90,
      targetFloatPercent: 100,
      targetTempC: 42,
      targetPh: "4.5 - 4.8",
      recommendedRpm: 12,
      safetyInstructions: "Add syntans sequentially with 15-minute drum run between additions.",
      description: "Fill flanks and bellies, improve grain tightness, buffability, and body fullness required for premium shoe uppers.",
      chemicals: [
        { id: "chem_poly_syntan", code: "SYN-POLYM", name: "Acrylic Polymer Retanning Syntan", dosagePercent: 3.5, unit: "%", hazard: "Safe", function: "Flank filling & grain tightness" },
        { id: "chem_phenolic_syntan", code: "SYN-PHEN", name: "Phenol-Formaldehyde Replacement Syntan", dosagePercent: 4.0, unit: "%", hazard: "Harmful", function: "Body fullness and leather roundness" },
        { id: "chem_mimosa_ext", code: "MIMOSA-GS", name: "Spray-Dried Mimosa / Wattle Extract", dosagePercent: 3.0, unit: "%", hazard: "Safe", function: "Vegetable tannin fullness & embossing retention" }
      ]
    },
    {
      stepNumber: 8,
      stepId: "step_dyeing_shading",
      name: "Dyeing & Shade Matching",
      phase: "Post-Tanning (Wet-End)",
      recommendedDurationMins: 75,
      targetFloatPercent: 150,
      targetTempC: 55,
      targetPh: "4.2 - 4.4",
      recommendedRpm: 14,
      safetyInstructions: "Verify bath exhaustion spectrophotometrically or visually before drainage.",
      description: "Impart desired fashion shade uniformly through hide cross-section using high-affinity anionic leather dyestuffs.",
      chemicals: [
        { id: "chem_ammonia", code: "NH4OH-25", name: "Aqueous Ammonia 25% (Penetrating Aid)", dosagePercent: 0.5, unit: "%", hazard: "Corrosive", function: "Dye dispersant and deep penetration" },
        { id: "chem_acid_dye", code: "DYE-BLK-B", name: "C.I. Acid Black Tannery Dye Concentrate", dosagePercent: 2.8, unit: "%", hazard: "Harmful", function: "Core & surface intense black coloration" },
        { id: "chem_formic_acid_fix", code: "HCOOH-FIX", name: "Formic Acid 85% (Fixation step diluted 1:5)", dosagePercent: 1.2, unit: "%", hazard: "Corrosive", function: "Fixes anionic dye molecules onto leather fiber" }
      ]
    },
    {
      stepNumber: 9,
      stepId: "step_fatliquoring",
      name: "Fatliquoring & Lubrication",
      phase: "Post-Tanning (Wet-End)",
      recommendedDurationMins: 80,
      targetFloatPercent: 120,
      targetTempC: 58,
      targetPh: "3.6 - 3.8",
      recommendedRpm: 14,
      safetyInstructions: "Temperature must stay above 50°C to keep oil emulsions stably suspended without oil spotting.",
      description: "Lubricate collagen fibrils with micro-emulsified oils so leather remains flexible, pliable, and soft upon drying.",
      chemicals: [
        { id: "chem_sulfited_fish_oil", code: "FAT-FISH", name: "Sulfited Natural Fish Oil Emulsion", dosagePercent: 5.5, unit: "%", hazard: "Safe", function: "Deep fiber softness & tensile elasticity" },
        { id: "chem_synthetic_fatliquor", code: "FAT-SYN", name: "Synthetic Chloroparaffin / Ester Fatliquor", dosagePercent: 3.5, unit: "%", hazard: "Safe", function: "Lightfastness, odorless softness, low fogging" },
        { id: "chem_phosphoric_fatliquor", code: "FAT-PHOS", name: "Phosphoric Acid Ester Water-Repellent Oil", dosagePercent: 2.0, unit: "%", hazard: "Safe", function: "Hydrophobic properties and grain feel" }
      ]
    },
    {
      stepNumber: 10,
      stepId: "step_top_wash_fix",
      name: "Top Washing & Fixation",
      phase: "Finishing Wet-End",
      recommendedDurationMins: 45,
      targetFloatPercent: 200,
      targetTempC: 30,
      targetPh: "3.4 - 3.6",
      recommendedRpm: 10,
      safetyInstructions: "Unload drum onto clean pallets; allow 24-48 hours sammying and conditioning rest.",
      description: "Final chemical fixing, surface rinsing of unfixed salts and oils to prevent subsequent fat spew or bloom.",
      chemicals: [
        { id: "chem_cationic_fixer", code: "CAT-FIX", name: "Cationic Polymeric Dye & Fat Fixer", dosagePercent: 0.8, unit: "%", hazard: "Harmful", function: "Locks surface fatliquor and prevents crocking" },
        { id: "chem_formic_top", code: "HCOOH-85", name: "Formic Acid 85% (Final Rinse)", dosagePercent: 0.6, unit: "%", hazard: "Corrosive", function: "Ensures bath pH 3.5 for full chrome binding" }
      ]
    }
  ],

  // 2. CHROME-FREE VEGETABLE TANNED COWHIDE
  veg_tanned_cowhide: [
    {
      stepNumber: 1,
      stepId: "step_veg_soaking",
      name: "Beamhouse Soaking & Dirt Wash",
      phase: "Beamhouse",
      recommendedDurationMins: 300,
      targetFloatPercent: 250,
      targetTempC: 20,
      targetPh: "7.8 - 8.5",
      recommendedRpm: 3,
      safetyInstructions: "Slow rotation speed to prevent mechanical damage to heavy cowhide grain.",
      description: "Rehydration of heavy cowhide selection with mild non-ionic wetting agents and bactericides.",
      chemicals: [
        { id: "chem_wetting_eco", code: "ECO-WET", name: "Biodegradable Fatty Alcohol Alkoxylate", dosagePercent: 0.4, unit: "%", hazard: "Safe", function: "Gentle rehydration" },
        { id: "chem_biocide_veg", code: "BIO-ECO", name: "Isothiazolinone Leather Preservation Biocide", dosagePercent: 0.1, unit: "%", hazard: "Irritant", function: "Bacterial defense during long soak" }
      ]
    },
    {
      stepNumber: 2,
      stepId: "step_veg_liming",
      name: "Hair-Save Liming & Plumping",
      phase: "Beamhouse",
      recommendedDurationMins: 900,
      targetFloatPercent: 140,
      targetTempC: 22,
      targetPh: "12.4 - 12.8",
      recommendedRpm: 2,
      safetyInstructions: "Maintain strict temperature below 24°C to prevent grain roughness in vegetable leather.",
      description: "Unhairing with hair-saving filter screen, firm plumping for smooth tooling and carving grain.",
      chemicals: [
        { id: "chem_lime_pure", code: "CAOH2-PURE", name: "Refined Hydrated Lime Powder", dosagePercent: 4.5, unit: "%", hazard: "Corrosive", function: "Controlled swelling of dense hides" },
        { id: "chem_sodium_sulfide", code: "NA2S-FLK", name: "Sodium Sulfide Flakes (60%)", dosagePercent: 1.5, unit: "%", hazard: "Corrosive", function: "Hair root softening" },
        { id: "chem_hair_save_aux", code: "SAVE-HAIR", name: "Mercaptan Hair-Saving Immunizer", dosagePercent: 0.6, unit: "%", hazard: "Harmful", function: "Hair immunization and intact recovery" }
      ]
    },
    {
      stepNumber: 3,
      stepId: "step_veg_deliming",
      name: "Deliming & Mild Bating",
      phase: "Beamhouse",
      recommendedDurationMins: 120,
      targetFloatPercent: 100,
      targetTempC: 32,
      targetPh: "7.8 - 8.2",
      recommendedRpm: 5,
      safetyInstructions: "Verify zero lime residue with phenolphthalein drop across 100% hide thickness.",
      description: "Thorough removal of all lime to allow vegetable tannin polymers to penetrate without creating brittle grain.",
      chemicals: [
        { id: "chem_amm_chloride", code: "NH4CL", name: "Ammonium Chloride Technical", dosagePercent: 2.5, unit: "%", hazard: "Irritant", function: "Gentle deliming without grain loosening" },
        { id: "chem_co2_delime", code: "CO2-GAS", name: "Pressurized Carbon Dioxide Float Sparging", dosagePercent: 1.0, unit: "% equiv", hazard: "Safe", function: "Eco-deliming and calcium bicarbonate solubilization" },
        { id: "chem_bate_veg", code: "BATE-SOFT", name: "Mild Bacterial Bate Formulation (800 LVU)", dosagePercent: 0.5, unit: "%", hazard: "Safe", function: "Controlled scud removal" }
      ]
    },
    {
      stepNumber: 4,
      stepId: "step_veg_pretanning",
      name: "Pre-Tanning & Conditioning",
      phase: "Tanyard",
      recommendedDurationMins: 180,
      targetFloatPercent: 60,
      targetTempC: 28,
      targetPh: "4.5 - 5.0",
      recommendedRpm: 6,
      safetyInstructions: "Maintain short float to increase tannin collision frequency and uptake.",
      description: "Condition pelts with synthetic tannins to lighten baseline color and prime hide for heavy plant polyphenols.",
      chemicals: [
        { id: "chem_pretanning_syntan", code: "SYN-PREP", name: "Disulfonic Acid Pre-tanning Syntan", dosagePercent: 3.0, unit: "%", hazard: "Safe", function: "Accelerates plant polyphenol penetration" },
        { id: "chem_sodium_formate", code: "HCOONA", name: "Sodium Formate Buffer", dosagePercent: 1.0, unit: "%", hazard: "Safe", function: "Stabilizes internal pH" }
      ]
    },
    {
      stepNumber: 5,
      stepId: "step_veg_tanning_main",
      name: "Vegetable Tanning & Penetration",
      phase: "Tanyard (Vegetable Drum)",
      recommendedDurationMins: 960,
      targetFloatPercent: 50,
      targetTempC: 32,
      targetPh: "3.8 - 4.2",
      recommendedRpm: 6,
      safetyInstructions: "High viscosity drum slurry. Check drum torque motor amperage hourly.",
      description: "Drum tanning using natural tree bark extracts: Quebracho for firmness and Mimosa for light color and smooth grain.",
      chemicals: [
        { id: "chem_mimosa_pure", code: "MIMOSA-WTL", name: "Clarified Mimosa (Wattle) Bark Extract Powder", dosagePercent: 12.0, unit: "%", hazard: "Safe", function: "Core vegetable tanning, pale pinkish hue" },
        { id: "chem_quebracho", code: "QUEBRACHO-S", name: "Sulfited Quebracho Heartwood Extract", dosagePercent: 10.0, unit: "%", hazard: "Safe", function: "Deep solidity, water resistance, firmness" },
        { id: "chem_chestnut", code: "CHESTNUT-POW", name: "Sweet Chestnut Wood Polyphenol Extract", dosagePercent: 5.0, unit: "%", hazard: "Safe", function: "High astringency, tightening structure" }
      ]
    },
    {
      stepNumber: 6,
      stepId: "step_veg_fatliquor_finish",
      name: "Natural Fatliquoring & Setting",
      phase: "Finishing Wet-End",
      recommendedDurationMins: 90,
      targetFloatPercent: 80,
      targetTempC: 45,
      targetPh: "3.6 - 3.8",
      recommendedRpm: 8,
      safetyInstructions: "Unload into conditioning room with humidity controlled at 65% RH.",
      description: "Drum nourishment with natural neat's-foot oil and lecithin for burnishing capability and vegetable pull-up finish.",
      chemicals: [
        { id: "chem_neatsfoot", code: "OIL-NEAT", name: "Sulfated Neat's-Foot Oil Compound", dosagePercent: 4.5, unit: "%", hazard: "Safe", function: "Natural leather conditioning & patina luster" },
        { id: "chem_lecithin_emul", code: "LEC-SOY", name: "Soya Lecithin Natural Phospholipid Emulsion", dosagePercent: 2.0, unit: "%", hazard: "Safe", function: "Internal fiber smoothness and burnish wax" },
        { id: "chem_oxalic_acid", code: "C2H2O4", name: "Oxalic Acid Grain Bleach (0.5% Rinse)", dosagePercent: 0.5, unit: "%", hazard: "Harmful", function: "Surface tannin stain clearing and brightening" }
      ]
    }
  ],

  // 3. NAPPA GARMENT SHEEPSKIN
  nappa_garment_sheep: [
    {
      stepNumber: 1,
      stepId: "step_nappa_soak",
      name: "De-Wooling Soak & Degreasing",
      phase: "Beamhouse",
      recommendedDurationMins: 180,
      targetFloatPercent: 250,
      targetTempC: 32,
      targetPh: "8.0 - 8.5",
      recommendedRpm: 5,
      safetyInstructions: "High natural grease content in sheepskins. Monitor degreasing float emulsion closely.",
      description: "Remove excessive natural subcutaneous fats and relax delicate sheep pelts without grain distortion.",
      chemicals: [
        { id: "chem_eco_degreaser", code: "DEGREASE-E", name: "Ethoxylated Alcohol Eco-Degreaser", dosagePercent: 2.5, unit: "%", hazard: "Irritant", function: "Solubilizes natural grease without solvents" },
        { id: "chem_soda_ash", code: "NA2CO3", name: "Sodium Carbonate (Soda Ash)", dosagePercent: 0.5, unit: "%", hazard: "Irritant", function: "Mild alkaline grease saponification" }
      ]
    },
    {
      stepNumber: 2,
      stepId: "step_nappa_tanning",
      name: "Soft Semi-Chrome Tanning",
      phase: "Tanyard",
      recommendedDurationMins: 240,
      targetFloatPercent: 100,
      targetTempC: 38,
      targetPh: "3.9 - 4.1",
      recommendedRpm: 8,
      safetyInstructions: "Ensure low mechanical action to preserve delicate garment grain.",
      description: "Achieve superior drape, lightness, and glove-soft temper using masked chromium and glutaraldehyde.",
      chemicals: [
        { id: "chem_bcs_garment", code: "CR2-SO4-G", name: "Masked Low-Astringency Chrome Sulfate", dosagePercent: 4.5, unit: "%", hazard: "Harmful", function: "Thermal stability with drapeable hand" },
        { id: "chem_glut_syntan", code: "GLUT-ALD", name: "Glutaraldehyde Softening Pre-Syntan", dosagePercent: 1.5, unit: "%", hazard: "Toxic", function: "Imparts sponge-like fullness and softness" }
      ]
    },
    {
      stepNumber: 3,
      stepId: "step_nappa_dye_fat",
      name: "Intense Anionic Dyeing & High-Fat Emulsion",
      phase: "Post-Tanning (Wet-End)",
      recommendedDurationMins: 120,
      targetFloatPercent: 180,
      targetTempC: 60,
      targetPh: "3.7 - 4.0",
      recommendedRpm: 12,
      safetyInstructions: "High fat content (14-16%) requires stepwise addition in warm water float.",
      description: "Impart garment fashion shade and maximum glove softness through high-load multi-oil fatliquoring.",
      chemicals: [
        { id: "chem_anionic_dye", code: "DYE-GAR-NVY", name: "Level Dyeing Anionic Navy / Black Micro-Dye", dosagePercent: 3.2, unit: "%", hazard: "Harmful", function: "Vibrant uniform fashion shade" },
        { id: "chem_soft_fatliquor", code: "FAT-GLOVE", name: "Sperm-Oil Derivative & Synthetic Soft Fatliquor", dosagePercent: 12.0, unit: "%", hazard: "Safe", function: "Extreme glove softness, drape, and flex" },
        { id: "chem_silicone_soft", code: "SIL-SOFT", name: "Micro-Silicone Emulsion Touch Modifier", dosagePercent: 1.5, unit: "%", hazard: "Safe", function: "Silky cashmere surface hand" }
      ]
    }
  ],

  // 4. HEAVY BUFFALO SOLE LEATHER
  heavy_buffalo_sole: [
    {
      stepNumber: 1,
      stepId: "step_buf_liming",
      name: "Extended Heavy Liming & Swelling",
      phase: "Beamhouse",
      recommendedDurationMins: 1440,
      targetFloatPercent: 150,
      targetTempC: 22,
      targetPh: "12.5 - 13.0",
      recommendedRpm: 2,
      safetyInstructions: "Heavy hides (30-40 kg each). Drum interlock safety guards mandatory during loading.",
      description: "24-hour deep beamhouse processing for dense water-buffalo hides to achieve maximum fiber unbundling.",
      chemicals: [
        { id: "chem_heavy_lime", code: "CAOH2-IND", name: "High-Purity Hydrated Lime", dosagePercent: 6.0, unit: "%", hazard: "Corrosive", function: "High alkaline swelling of thick hides" },
        { id: "chem_sodium_sulfide_sol", code: "NA2S-60", name: "Sodium Sulfide Flakes 60%", dosagePercent: 2.4, unit: "%", hazard: "Corrosive", function: "Root unhairing and scud dissolving" }
      ]
    },
    {
      stepNumber: 2,
      stepId: "step_buf_drum_tan",
      name: "High-Density Condensed Tannin Saturation",
      phase: "Tanyard (Sole Drum)",
      recommendedDurationMins: 1800,
      targetFloatPercent: 40,
      targetTempC: 35,
      targetPh: "3.5 - 3.8",
      recommendedRpm: 4,
      safetyInstructions: "Short float high tannin loading. Monitor drum motor temperature continuously.",
      description: "Dense saturation with heavy chestnut and valonea tannins for maximum hardness, abrasion resistance, and water impermeability.",
      chemicals: [
        { id: "chem_quebracho_nat", code: "QUEBRACHO-N", name: "Natural Quebracho Extract Solids", dosagePercent: 16.0, unit: "%", hazard: "Safe", function: "Extreme density and sole wear durability" },
        { id: "chem_chestnut_heavy", code: "CHESTNUT-HVY", name: "Chestnut Polyphenol Extract 100% Powder", dosagePercent: 12.0, unit: "%", hazard: "Safe", function: "High water repellency and rigidity" },
        { id: "chem_magnesium_sulfate", code: "MGSO4-EPSOM", name: "Epsom Salt (Magnesium Sulfate)", dosagePercent: 3.0, unit: "%", hazard: "Safe", function: "Fills void spaces and increases yield weight" }
      ]
    }
  ],

  // 5. NUBUCK & SUEDE COWHIDE
  nubuck_suede_cowhide: [
    {
      stepNumber: 1,
      stepId: "step_nubuck_tan",
      name: "Tight-Grain Chrome Tanning & Buffing Pre-Treatment",
      phase: "Tanyard",
      recommendedDurationMins: 360,
      targetFloatPercent: 80,
      targetTempC: 38,
      targetPh: "3.8 - 4.0",
      recommendedRpm: 10,
      safetyInstructions: "Strict basification control to ensure uniform fiber consistency for subsequent nap buffing.",
      description: "Chrome tanning with specialized resin syntans to ensure fibers shear cleanly during buffing without loose fluff.",
      chemicals: [
        { id: "chem_bcs_nubuck", code: "CR2-SO4", name: "Basic Chromium Sulfate 33%", dosagePercent: 6.5, unit: "%", hazard: "Harmful", function: "Standard chrome crosslinking" },
        { id: "chem_resin_syntan", code: "SYN-RESIN", name: "Dicyandiamide Resin Buffing Syntan", dosagePercent: 3.0, unit: "%", hazard: "Safe", function: "Fills grain layer to produce tight fine velvet nap" }
      ]
    },
    {
      stepNumber: 2,
      stepId: "step_nubuck_dye_fat",
      name: "Deep Suede Dye Penetration & Dry-Feel Fatliquor",
      phase: "Post-Tanning (Wet-End)",
      recommendedDurationMins: 110,
      targetFloatPercent: 200,
      targetTempC: 55,
      targetPh: "3.6 - 3.8",
      recommendedRpm: 14,
      safetyInstructions: "Avoid surface-greasy fatliquors which ruin velvet nap appearance.",
      description: "Thorough 100% cross-section penetration dyeing with non-oily synthetic fatliquors.",
      chemicals: [
        { id: "chem_suede_dye", code: "DYE-SUEDE", name: "Penetrating Anionic Earth Tone Dye", dosagePercent: 4.5, unit: "%", hazard: "Harmful", function: "Full cross-section suede dyeing" },
        { id: "chem_dry_fatliquor", code: "FAT-DRY-FL", name: "Synthetic Polymeric Dry-Touch Fatliquor", dosagePercent: 6.0, unit: "%", hazard: "Safe", function: "Softness without surface oiliness or gloss" },
        { id: "chem_water_repellent_fluor", code: "REP-FLUOR", name: "Fluorocarbon Water & Oil Repellent Emulsion", dosagePercent: 3.5, unit: "%", hazard: "Harmful", function: "Hydrophobic & stain repellent barrier on suede nap" }
      ]
    }
  ],

  // 6. WATER-RESISTANT WET-WHITE AUTOMOTIVE
  wet_white_automotive: [
    {
      stepNumber: 1,
      stepId: "step_auto_wetwhite_tan",
      name: "Chrome-Free Wet-White Syntan Tanning",
      phase: "Tanyard (Zero Chrome)",
      recommendedDurationMins: 420,
      targetFloatPercent: 90,
      targetTempC: 40,
      targetPh: "4.2 - 4.5",
      recommendedRpm: 10,
      safetyInstructions: "Chrome-free zone. Verify zero cross-contamination from chrome floats.",
      description: "Synthetic tanning using modified glutaraldehyde and aluminium/silicon compounds to achieve high shrinkage temperature without chrome.",
      chemicals: [
        { id: "chem_glut_aldehyde_mod", code: "GLUT-MOD-70", name: "Modified Glutaraldehyde Tanning Agent", dosagePercent: 3.5, unit: "%", hazard: "Toxic", function: "Forms covalent bonds with collagen amines" },
        { id: "chem_alum_complex", code: "AL-COMPLEX", name: "Synthetic Aluminium Triformate Syntan", dosagePercent: 4.0, unit: "%", hazard: "Irritant", function: "Enhances shrinkage temperature to > 85°C" },
        { id: "chem_polycarboxylic_acid", code: "POLY-CARB", name: "Polycarboxylic Aromatic Syntan", dosagePercent: 5.0, unit: "%", hazard: "Safe", function: "Fullness, tight grain, lightfastness" }
      ]
    },
    {
      stepNumber: 2,
      stepId: "step_auto_low_fog_fat",
      name: "Low-Fogging Automotive Retanning & Waterproofing",
      phase: "Post-Tanning (Wet-End)",
      recommendedDurationMins: 130,
      targetFloatPercent: 120,
      targetTempC: 50,
      targetPh: "3.5 - 3.8",
      recommendedRpm: 12,
      safetyInstructions: "Strict compliance with DIN 75201 Gravimetric Fogging standards (< 1.5 mg emission).",
      description: "Low-emission high molecular weight polymers and silicones engineered for modern car interiors.",
      chemicals: [
        { id: "chem_low_fog_fat", code: "FAT-AUTO-FOG", name: "High Molecular Weight Low-Fogging Fatliquor", dosagePercent: 8.0, unit: "%", hazard: "Safe", function: "Extreme thermal aging stability without window fogging" },
        { id: "chem_silicone_waterproof", code: "SIL-WATERP", name: "Reactive Silicone Waterproofing Polymer", dosagePercent: 5.0, unit: "%", hazard: "Safe", function: "Dynamic Maeser flex resistance > 50,000 cycles" },
        { id: "chem_uv_absorber", code: "UV-ABSORB", name: "Benzotriazole Leather UV Stabilizer", dosagePercent: 1.0, unit: "%", hazard: "Harmful", function: "Protects against cockpit sunlight fading" }
      ]
    }
  ]
};

// Initial Operations History - Empty by default (User records actual batch activities)
export const INITIAL_PROCESSING_HISTORY = [];

// Initial Chemical Inventory - Empty by default (User records or uploads actual inventory)
export const INITIAL_CHEMICAL_INVENTORY = [];

// Standard Chemical Catalog Template (Available for quick import if requested by user)
export const STANDARD_CHEMICAL_CATALOG = [
  { id: "inv_bcs", code: "CR2-SO4", name: "Basic Chromium Sulfate 33%", category: "Tanning Agent", minStockKg: 2000, unitPriceUsd: 1.45, location: "Bay A - Heavy Chem Store" },
  { id: "inv_lime", code: "CAOH2", name: "Hydrated Calcium Hydroxide (Lime)", category: "Alkali", minStockKg: 3000, unitPriceUsd: 0.22, location: "Bay C - Lime Pit Storage" },
  { id: "inv_sulfide", code: "NA2S-60", name: "Sodium Sulfide Flakes (60%)", category: "Unhairing", minStockKg: 1000, unitPriceUsd: 0.85, location: "Hazmat Store Room 1" },
  { id: "inv_formic", code: "HCOOH-85", name: "Formic Acid 85% IBCs", category: "Acid", minStockKg: 800, unitPriceUsd: 1.15, location: "Acid Tank Farm" },
  { id: "inv_sulfuric", code: "H2SO4-98", name: "Sulfuric Acid 98%", category: "Acid", minStockKg: 1500, unitPriceUsd: 0.40, location: "Acid Tank Farm" },
  { id: "inv_mimosa", code: "MIMOSA-WTL", name: "Spray Dried Mimosa Extract", category: "Vegetable Extract", minStockKg: 2000, unitPriceUsd: 2.10, location: "Bay B - Dry Tannin Store" },
  { id: "inv_quebracho", code: "QUEBRACHO-S", name: "Sulfited Quebracho Extract", category: "Vegetable Extract", minStockKg: 1500, unitPriceUsd: 2.45, location: "Bay B - Dry Tannin Store" },
  { id: "inv_fish_oil", code: "FAT-FISH", name: "Sulfited Fish Oil Compound", category: "Fatliquor", minStockKg: 1000, unitPriceUsd: 1.95, location: "Liquid Drum Zone" },
  { id: "inv_poly_syntan", code: "SYN-POLYM", name: "Acrylic Polymer Syntan", category: "Syntan", minStockKg: 800, unitPriceUsd: 3.20, location: "Chemical Warehouse 2" },
  { id: "inv_acid_dye", code: "DYE-BLK-B", name: "C.I. Acid Black Dye Concentrate", category: "Dyestuff", minStockKg: 150, unitPriceUsd: 14.80, location: "Color Kitchen Staging" }
];

// User Role Presets
export const USER_ROLES = [
  { id: "operator", title: "Senior Drum Operator", badge: "Wet-End Certified", defaultRole: "operator" },
  { id: "chemist", title: "Chief Tannery Chemist & QC Lead", badge: "QC Specialist", defaultRole: "chemist" },
  { id: "manager", title: "Tannery Plant General Manager", badge: "Plant Director", defaultRole: "manager" },
  { id: "admin", title: "Enterprise System Administrator", badge: "SuperAdmin", defaultRole: "admin" }
];

export const DEMO_USERS = [
  {
    id: "user_operator",
    name: "Tannery Operator",
    email: "operator@tannery.cloud",
    role: "operator",
    roleTitle: "Senior Drum Operator",
    companyId: "",
    companyName: "Selected Company",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    badge: "Certified Drummer",
  },
  {
    id: "user_chemist",
    name: "Tannery Chemist",
    email: "chemist@tannery.cloud",
    role: "chemist",
    roleTitle: "Chief Tannery Chemist & QC Lead",
    companyId: "",
    companyName: "Selected Company",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    badge: "QC Specialist",
  },
  {
    id: "user_manager",
    name: "Plant Manager",
    email: "manager@tannery.cloud",
    role: "manager",
    roleTitle: "Tannery Plant General Manager",
    companyId: "",
    companyName: "Selected Company",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    badge: "Plant Director",
  },
  {
    id: "user_admin",
    name: "System Administrator",
    email: "admin@drumsos.cloud",
    role: "admin",
    roleTitle: "Enterprise System Administrator",
    companyId: "",
    companyName: "Selected Company",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    badge: "Global SuperAdmin",
  }
];
