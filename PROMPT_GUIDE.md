# Medicus — 20-Section Note Generation Guide

## Quick Start

1. Open Admin panel → click **"View & Copy Prompt"**
2. Replace `[TOPIC NAME]` and `[MODULE NAME]` at the top and bottom
3. Send to **Claude Sonnet or Opus** (claude.ai or API)
4. Copy the JSON output
5. In Admin → select Module → enter Topic Name → paste JSON → **Validate & Add Topic**

## Running Locally (Permanent Storage)

```bash
# Install Node.js (v16+), then:
node server.js
# Open: http://localhost:3000
```

On **first run**, a random admin password is printed to the terminal.  
Data is saved to `data.json` in the same folder — commit it to Git to persist.

## Running on Git / Deployment

- Push the whole folder to GitHub/GitLab
- Deploy `server.js` on any Node host (Railway, Render, Fly.io, etc.)
- Set `PORT` environment variable if needed
- The `data.json` file holds all your content — back it up

## File-Only Mode (No Server)

Open `index.html` directly in a browser. Data goes to **localStorage** — persists in the same browser, lost if you clear browser data. Export regularly via Admin → Export Data.

## Admin Password

- **Local server**: shown in terminal on first run, stored in `data.json`
- **Browser-only**: randomly generated and stored in localStorage; hint shown on login screen
- **Change it**: Admin → Security → enter new password → Change
- **Session**: password is kept in memory only for the current browser session — re-enter on page reload

## 20 Required Sections

| # | Section | Icon | Key Components |
|---|---------|------|----------------|
| 1 | Overview | 🏥 | stat-grid (6 boxes), definition hbox, comparison grid, pearls |
| 2 | Aetiology | 🦠 | organism table with Gram stain, OR aetiology classification |
| 3 | Epidemiology | 📊 | stat-grid, incidence table, sex/age breakdown |
| 4 | Risk Factors | ⚠️ | modifiable vs non-modifiable comp-grid, RR values |
| 5 | Pathophysiology | ⚗️ | step-flow (macro) + timeline (cellular/molecular) |
| 6 | Classification | 🗂️ | WHO/clinical systems table, chips, comparison grid |
| 7 | Clinical | 🩺 | classic hbox.red, symptoms vs signs two-col, scoring table |
| 8 | Named Signs | 👁️ | table: name, technique, positive finding, significance |
| 9 | Investigations | 🔬 | full table with sensitivity/specificity, algorithm hbox |
| 10 | Diagnosis | ✅ | gold standard hbox.teal, diagnostic criteria table, formula |
| 11 | Imaging | 🖼️ | pacs-grid 3×2 with SVG simulations of 6 modalities |
| 12 | Management | 💊 | step-flow, drug-grid (7 fields each), secondary prevention |
| 13 | Special Regimens | 🧬 | MDR/resistant cases, 3+ trial badges |
| 14 | Complications | ⛔ | chips overview, full table with timing and management |
| 15 | Differentials | 🔄 | comparison table with key differentiators |
| 16 | Special Populations | 👶 | pregnancy, HIV, renal/hepatic, elderly, paediatric |
| 17 | Exam Pearls | ⭐ | pearl-list with 15 numbered one-liners |
| 18 | Mnemonics | 🧠 | 3+ mnemonic boxes with full letter expansions |
| 19 | Exam Traps | 🪤 | 8+ trap-boxes with ⚠️ format |
| 20 | Prognosis | 📈 | stat-grid, prognostic factors, natural history timeline |

## JSON Validation Checklist

- [ ] `"sections"` array with exactly **20** objects
- [ ] Each section has: `title`, `label`, `h1`, `sub`, `icon`, `html`
- [ ] `"quiz"` array with exactly **10** question objects
- [ ] Each question: `q`, `opts` (5 items, A–E prefix), `correct` (integer 0–4), `exp`, `whys` (4 items)
- [ ] Valid JSON (no trailing commas, all strings properly escaped)
- [ ] HTML uses only Medicus CSS classes (no inline styles other than color)

## Suggested Modules & Topics

| Module | Icon | Topics |
|--------|------|--------|
| Cardiology | 🫀 | MI, NSTEMI, Heart Failure, AF, Aortic Stenosis, DVT/PE |
| Neurology | 🧠 | Stroke, TIA, Parkinson's, MS, Epilepsy, Meningitis |
| Respiratory | 🫁 | COPD, Asthma, Pneumonia, TB, PE, Pleural Effusion |
| Gastroenterology | 🍽️ | IBD, Cirrhosis, Pancreatitis, GI Bleed, Hepatitis |
| Nephrology | 🫘 | AKI, CKD, Nephrotic Syndrome, Glomerulonephritis |
| Endocrinology | 🔬 | DM Type 1&2, Thyroid disorders, Addison's, Cushing's |
| Haematology | 🩸 | Anaemia, Leukaemia, Lymphoma, Coagulopathies |
| Rheumatology | 🦴 | RA, SLE, Gout, Vasculitis, Osteoporosis |
| Infectious | 🦠 | Sepsis, HIV, Malaria, TB, Dengue, COVID-19 |
| Obstetrics | 🤱 | Pre-eclampsia, PPH, Ectopic, GDM |
| Surgery | 🔪 | Appendicitis, Bowel Obstruction, Hernia, AAA |
| Psychiatry | 🧩 | Depression, Schizophrenia, Bipolar, Anxiety |

## Architecture

```
medicus-platform/
├── index.html      ← Single-page app (all UI + JS)
├── server.js       ← Node.js REST API server
├── data.json       ← Created automatically on first run
├── package.json    ← npm metadata
├── PROMPT_GUIDE.md ← This file
└── .gitignore
```
