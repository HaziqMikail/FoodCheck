# 🌿 SafeBite — Instant Food Allergen & Health Scanner

SafeBite is a stateless, privacy-first web application that instantly analyzes packaged food ingredients and nutrition labels. It detects allergens, flags health risks based on user-configured conditions, and supports both manual text input and AI-powered Computer Vision scanning via live camera or image upload.

All data is stored exclusively in `localStorage` — zero remote servers, zero accounts, 100% private.

## Features

- **Multimodal Input** — Quick test presets, manual text entry, live camera scanning, and image upload
- **AI Vision Integration** — Google Gemini Flash and OpenAI GPT-4o-mini support for OCR extraction from food packaging photos
- **Allergen Detection** — Matches against major allergen groups with bilingual support (English + Malay ingredient aliases)
- **Health Condition Profiling** — Configurable health goals (hypertension, diabetes, celiac, lactose intolerance) with custom condition keywords
- **Dietary Rules** — Halal, Vegan, Vegetarian, and Kosher restriction checking
- **Deterministic Rules Engine** — Offline-first ingredient analysis with severity scoring and category-based flagging
- **Scan History** — Local history of past scans with re-analysis on profile change
- **Responsive Layout** — Full-page 2-column grid on desktop, single-column on mobile with adaptive spacing
- **Camera Lifecycle Management** — Auto-opens on camera tab, auto-closes on tab switch, modal open, or browser visibility change
- **In-App API Key Configuration** — Save AI provider keys via modal (persisted to localStorage) or `.env` file

## Architecture

SafeBite uses a **stateless architecture** — all computation happens client-side with no backend. The rules engine performs deterministic matching against a curated ingredient database, while optional AI Vision provides OCR for packaging photos.

```
User Profile (localStorage)
        │
        ▼
┌─────────────────┐     ┌──────────────────┐
│  Input Sources   │────▶│   Rules Engine    │────▶ Verdict Card
│  (Text/Camera/   │     │  (Deterministic   │     (Safe/Caution/
│   Upload/AI)     │     │   Matching)       │      Danger)
└─────────────────┘     └──────────────────┘
        │
        ▼ (Camera/Upload only)
┌─────────────────┐
│   AI Vision API  │
│  (Gemini/OpenAI) │
└─────────────────┘
```

## File Structure

```
SafeBite/
├── public/
│   ├── favicon.svg              # Browser tab icon
│   ├── icons.svg                # SVG icon sprites
│   └── logo.png                 # SafeBite logo asset
│
├── src/
│   ├── assets/
│   │   └── logo.png             # Logo used in header component
│   │
│   ├── components/
│   │   ├── Header.jsx           # Top app bar — branding, profile count, history toggle
│   │   ├── HistoryDrawer.jsx    # Local scan history list (desktop sidebar + mobile toggle)
│   │   ├── OnboardingModal.jsx  # Health & dietary preferences configuration modal
│   │   ├── ScannerSection.jsx   # Main scanner — tabs (text/camera/upload), AI processing, API key modal
│   │   └── VerdictCard.jsx      # Scan result display — verdict badge, matched flags, severity
│   │
│   ├── data/
│   │   └── ingredients_data.json  # Curated ingredient database with allergen/health/dietary mappings
│   │
│   ├── utils/
│   │   ├── aiVision.js          # AI Vision service — Gemini & OpenAI API integration, key management
│   │   ├── imageUtils.js        # CV utilities — video frame capture, image compression, base64 encoding
│   │   ├── rulesEngine.js       # Deterministic rules engine — ingredient matching, severity scoring
│   │   └── storage.js           # localStorage abstraction — profile CRUD, scan history, option constants
│   │
│   ├── App.jsx                  # Root component — state management, dashboard grid layout
│   ├── App.css                  # App-level animation keyframes
│   ├── index.css                # Global design system — variables, responsive breakpoints, all component styles
│   └── main.jsx                 # Vite entry point
│
├── .env                         # Environment variables (VITE_GEMINI_API_KEY / VITE_OPENAI_API_KEY)
├── .env.example                 # Template for required environment variables
├── index.html                   # HTML shell with SEO meta tags, font preloading, favicon
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration with React plugin
├── PLAN.md                      # Detailed project blueprint and specifications
└── .gitignore                   # Git ignore rules
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Vanilla CSS with custom properties design system |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans, Outfit (Google Fonts) |
| AI Vision | Google Gemini 1.5 Flash API, OpenAI GPT-4o-mini API |
| Storage | Browser localStorage (zero-server) |


