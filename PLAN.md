# 🥗 FoodCheck — Stateless Project Plan & Blueprint

## Executive Summary
**FoodCheck** is a cross-platform, mobile-first web application designed to instantly analyze packaged food ingredients and nutrition labels. By leveraging flexible input methods (mobile camera capture or laptop file upload), lightweight Optical Character Recognition (OCR), and a deterministic rules-based matching engine against user health profiles, FoodCheck flags allergens, dietary conflicts, and unwanted additives in real-time.

**Target Users:** Consumers with food allergies, strict dietary preferences (vegan, halal, celiac), or specific health conditions (diabetes, hypertension).  
**Deployment Model:** 100% Free prototype tier on Vercel (completely stateless, zero database/auth infrastructure required).  
**Core Strategy:** Stateless client-first architecture; browser `localStorage` for privacy & zero-friction onboarding; bundled static dictionary (`ingredients_data.json`); rules engine over custom ML models.

---

## 📊 Part 1: Core Product Features

### 1.1 Dual Input & Smart OCR Parsing
- **Inputs Supported:**
  - **Mobile:** Direct HTML5 camera stream (`navigator.mediaDevices.getUserMedia`) for instant aisle scanning.
  - **Desktop/Laptop:** Drag-and-drop file upload zone for photos, screenshots, or spec sheets.
- **Layout-Agnostic Extraction:**
  - Extracts text across unstructured, curved, or multi-language label designs.
  - **Boundary & Anchor Detection:** Scans for keywords like `"Ingredients:"`, `"Contains:"`, or `"Ingrédients:"` while stripping away marketing fluff.
  - **Fuzzy Token Matching:** Cross-references synonyms and multi-lingual variants (e.g., matching English *"Milk"* / Malay *"Susu"*, or *"Sodium Chloride"* and *"Salt"*).

---

### 1.2 User Health & Dietary Profile (Stateless LocalStorage)

#### Local Storage (Browser-Based State)
- **How it works:** When the user first opens FoodCheck, a clean onboarding modal pops up asking: *"What are your allergies or health goals?"* (e.g., checking Peanuts, Dairy, or High Sodium).
- **Where it's saved:** Their choices are saved directly in the browser's `localStorage` on their phone or laptop.
- **The Result:** Every time they scan a product, the frontend reads their stored preferences from `localStorage` and runs the rules check locally or passes them to a stateless API route—all without requiring an account or server-side database.
- **Edit Anytime:** Users can update their allergies, health goals, and additive blacklist at any time via a lightweight settings drawer, instantly updating `localStorage`.

#### Profile Schema Options
- **Allergens:** Peanuts, Tree Nuts, Dairy/Milk, Gluten/Wheat, Soy, Eggs, Shellfish, Fish, Sesame.
- **Health Conditions / Goals:** Hypertension (Sodium limits), Diabetes (Sugar limits), Celiac Disease.
- **Lifestyle / Religious Rules:** Vegan, Vegetarian, Halal, Kosher.
- **Additive Preferences:** Flag artificial preservatives, synthetic dyes (e.g., Tartrazine/E102), or flavor enhancers (e.g., MSG/E621).

---

### 1.3 Color-Coded Verdict & Explanatory Breakdown
Once scanned, FoodCheck presents a simple three-tier verdict card:
- 🟢 **Safe:** No matched allergens or flagged ingredients found.
- 🟡 **Warning:** Contains moderate/high levels of sugar, sodium, or minor restricted additives.
- 🔴 **Danger:** Explicit match with a severe allergy or strict health restriction.

*Tapping any flagged ingredient details why it was highlighted (e.g., "Contains 'Casein' — a dairy derivative matching your Milk allergy").*

---

## 💻 Part 2: Technical Architecture

### 2.1 Stack Overview
- **Frontend Framework:** React or Next.js (Mobile-first responsive UI).
- **Styling:** Vanilla CSS or Tailwind CSS.
- **State Persistence:** Browser `localStorage` (Zero database, completely stateless).
- **Hosting Platform:** **Vercel** (Static frontend + optional stateless Serverless Edge API routes, 100% Free tier).
- **Ingredient Knowledge Base:** Static bundled dictionary (`ingredients_data.json`) evaluated directly in-memory.
- **Text Extraction (OCR):** Tesseract.js (in-browser client-side execution) or lightweight cloud OCR.
- **Analysis Engine:** Deterministic rule-matching JavaScript engine (runs client-side or in a stateless serverless function).

---

### 2.2 Stateless Architecture Diagram
```
[ User Input ] (Mobile Camera / Laptop Upload)
       │
       ▼
[ Client / Browser ] ───(Run OCR / Tesseract.js)───► [ Clean Text Dump ]
       │                                                     │
       ├─► Read User Preferences from `localStorage`         │
       │                                                     │
       ▼                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│               Stateless Matching Engine                         │
│       (Runs Client-Side OR via POST /api/analyze)                │
│                                                                 │
│  • Input: Raw Extracted Text + User Preferences from Client      │
│  • Reference: Static `ingredients_data.json` Dictionary          │
│  • Logic: Tokenize -> Normalize -> Match Synonyms -> Score Risk │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
[ Instant Verdict JSON ] ───► Display Color-Coded Card on Mobile/Desktop
                                 │
                                 ▼
                     (Optional) Save Scan to
                   `localStorage` Scan History
```

---

## 🗄️ Part 3: Data Contracts & Storage (Stateless & Local)

Because FoodCheck operates completely statelessly, no relational database (e.g., Supabase, PostgreSQL) or authentication server is required. All user-specific state lives in the user's browser, while ingredient definitions are bundled as static data.

### 3.1 LocalStorage Schema Contracts

#### 1. `foodcheck_user_profile`
Stores onboarding selections and active user preferences.
```json
{
  "onboarded": true,
  "allergies": ["dairy", "peanuts", "gluten"],
  "health_goals": ["hypertension", "diabetes"],
  "dietary_restrictions": ["halal"],
  "flagged_additives": ["E621", "E102"],
  "updated_at": "2026-10-21T13:30:00.000Z"
}
```

#### 2. `foodcheck_scan_history` (Optional Client-Side Cache)
Stores the last 10–20 scans locally so users can review recent checks offline without a server.
```json
[
  {
    "id": "scan_1729512345",
    "timestamp": "2026-10-21T13:35:00.000Z",
    "verdict": "danger",
    "detected_ingredients": ["Whey", "Peanut Oil"],
    "flagged_reasons": [
      {
        "ingredient": "Whey",
        "matched_allergen": "dairy",
        "severity": "high",
        "explanation": "Whey is a dairy byproduct matching your Dairy allergy."
      }
    ]
  }
]
```

---

### 3.2 Master Ingredient Knowledge Base (`ingredients_data.json`)
The canonical ingredient dictionary is bundled directly as static JSON (`ingredients_data.json`), requiring zero database queries or cold starts.

**Entry Structure:**
```json
{
  "canonical_name": "Milk",
  "aliases": [
    "Susu",
    "Susu Lembu",
    "Cow's Milk",
    "Milk Solids",
    "Pepejal Susu",
    "Whey",
    "Susu Wei",
    "Casein",
    "Kasein",
    "Sodium Caseinate"
  ],
  "category": "allergen",
  "associated_allergens": ["dairy", "milk"],
  "health_risk_tags": ["lactose_intolerance", "milk_allergy"]
}
```

---

### 3.3 Stateless Analysis Payload (`POST /api/analyze` or Local Function)
When analysis is triggered, the payload is completely self-contained:

**Request Payload:**
```json
{
  "raw_text": "Ingredients: Wheat flour, sugar, whey powder, vegetable oil, salt, E621.",
  "user_profile": {
    "allergies": ["dairy"],
    "health_goals": ["hypertension"],
    "dietary_restrictions": [],
    "flagged_additives": ["E621"]
  }
}
```

**Response Output:**
```json
{
  "verdict": "danger",
  "score": 85,
  "flags": [
    {
      "ingredient": "whey powder",
      "canonical": "Milk",
      "type": "allergen",
      "severity": "danger",
      "reason": "Matches allergy: dairy"
    },
    {
      "ingredient": "E621",
      "canonical": "Monosodium Glutamate",
      "type": "additive",
      "severity": "warning",
      "reason": "Matches flagged additive: E621 (MSG)"
    }
  ]
}
```

---

## 🚀 Part 4: Implementation Roadmap

### Phase 1: Setup & Stateless Foundation (Week 1)
- [x] Initialize Next.js / React repository with Tailwind CSS / Vanilla CSS.
- [x] Bundle `ingredients_data.json` into static assets/utilities for zero-latency lookup.
- [x] Build `useLocalStorage` hook and profile state manager.

### Phase 2: Onboarding & Multi-Input Camera (Week 2)
- [x] Build onboarding modal asking *"What are your allergies or health goals?"* on first load.
- [x] Save preferences directly into browser `localStorage`.
- [x] Build mobile camera feed component (`navigator.mediaDevices.getUserMedia`).
- [x] Implement drag-and-drop file upload zone for laptop users.
- [x] Integrate OCR text extraction logic (Tesseract.js).

### Phase 3: Stateless Rules Engine & Analysis (Week 3)
- [x] Implement deterministic rule-matching logic (text normalization $\rightarrow$ alias search against `ingredients_data.json` $\rightarrow$ compare against `localStorage` profile).
- [x] Provide local/stateless execution (optionally exposed via `/api/analyze`).
- [x] Return structured verdict (🟢 Safe, 🟡 Warning, 🔴 Danger) with explanatory cards.

### Phase 4: UI Polish & Free Vercel Deployment (Week 4)
- [x] Design clear result views with ingredient breakdown and reason tags.
- [x] Add settings drawer to allow users to update their `localStorage` preferences anytime.
- [x] Deploy prototype to Vercel (100% Free static/serverless tier).
- [x] Conduct cross-platform testing (Mobile Safari, Chrome on Android, Desktop).

---

## 🎯 Part 5: Success Metrics for Prototype
- **Zero Infrastructure Cost:** 100% free hosting on Vercel with zero database, auth, or storage bills.
- **Zero Friction & Instant Onboarding:** No signup, email verification, or password creation required.
- **Privacy-First:** User health data never leaves the client's device unencrypted or permanently stored in a remote database.
- **Execution Speed:** Scan-to-verdict response time under 1–2 seconds (eliminates database round-trips).
- **Accuracy:** >90% detection of critical allergens (peanuts, gluten, dairy) across English and bilingual (Malay) food labels.
- **Cross-Platform:** Seamlessly functional on smartphone browsers and desktop laptops.