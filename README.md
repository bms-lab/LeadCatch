# LeadCatch — Production-Ready Service Lead & Quote CRM

LeadCatch is a lightweight, zero-maintenance, zero-cost ($0 budget) client-side CRM and quote management platform designed specifically for independent home-service operators, including cleaners, painters, plumbers, gardeners, electricians, and handymen.

It eliminates lost revenue from forgotten inquiries, untracked estimates, and abandoned follow-ups with zero monthly subscription fees, zero required API keys, and zero paid database hosting.

---

## Key Features

1. **Revenue & Opportunity Dashboard**:
   - Live distinction between **Estimated Pipeline** (prospective open deals) and **Won Revenue** (confirmed completed cash).
   - Instant count of **New Inquiries**, **Quotes Awaiting Response**, and **Overdue Follow-ups**.
   - Prioritized queue of upcoming client check-ins with one-click outreach launcher.

2. **Lead & Opportunity Tracking**:
   - Complete CRUD operations: Add, Edit, Delete, Filter, and Search leads.
   - Rich fields: Contact Name, Property/Business Details, Phone, Email, Service Type, Lead Source, Estimated Value, Next Follow-Up Date, Status, and Project Notes.
   - Safe confirmation modals on all destructive deletions.

3. **Itemized Quote Builder & Printable PDF**:
   - Multi-line itemization with real-time subtotal, custom discount %, tax rate %, and grand total calculations.
   - Pre-fill customer details directly from an existing pipeline lead.
   - Built-in **Print / Save to PDF** layout with print stylesheets that strip application sidebars and buttons, generating a clean client-ready service quote.

4. **Follow-Up Assistant**:
   - 5 field-tested home-service scenarios: *First Contact Response*, *Friendly Reminder (2–3 Days)*, *Quote Follow-Up*, *Final Check-In*, and *Won / Booking Confirmation*.
   - Dynamic merge tags (`{customerName}`, `{serviceType}`, `{quoteNumber}`, `{businessName}`, `{quoteTotal}`).
   - One-click copy with clipboard toast notification.
   - Direct **WhatsApp link (`wa.me`)** and **Email client (`mailto:`)** launchers with pre-filled text.
   - **Zero-Spam Notice**: Outreach is strictly manual and user-controlled — no unwanted automatic messages are dispatched behind your back.

5. **Reports & Acquisition Analytics**:
   - Closed-deal win rate (%) and overall conversion rate with division-by-zero protection.
   - Revenue and job breakdown by service category and acquisition source.
   - Timeframe filtering: All Time, Last 30 Days, Last 90 Days.

6. **Local Data Management & Portability**:
   - High-performance browser `localStorage` persistence.
   - **JSON Export**: Download a full timestamped JSON backup with one click.
   - **JSON Import**: Upload and validate backup files with "Replace All" or "Merge" modes.
   - **Restore Demo Data**: Instant 1-click restore to sample cleaning, painting, plumbing, and gardening records.
   - **Clear All Data**: Completely wipe local storage with double-confirmation protection.

---

## Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or later recommended)
- npm or bun

### Windows PowerShell Commands

```powershell
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/LeadCatch.git
cd LeadCatch

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

### Build for Production

```powershell
# Type check and build optimized static assets
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment Instructions

### 1. GitHub Setup

```powershell
# Initialize git repository (if not already initialized)
git init
git add .
git commit -m "feat: complete production-ready LeadCatch application"

# Rename branch to main
git branch -M main

# Add your GitHub remote repository
git remote add origin https://github.com/YOUR_USERNAME/LeadCatch.git

# Push code to GitHub
git push -u origin main
```

### 2. Vercel Deployment (Recommended — 100% Free Tier)

Deploying LeadCatch to Vercel requires zero server configuration because it is a self-contained React SPA.

#### Option A: Via Vercel Web Dashboard (Easiest)
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select your **LeadCatch** repository.
3. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your app will be live on a global CDN in under 60 seconds with a free `.vercel.app` domain and automatic HTTPS.

#### Option B: Via Vercel CLI

```powershell
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Log in and deploy
vercel

# 3. Deploy to production
vercel --prod
```

The included `vercel.json` ensures that all browser refreshes rewrite to `/index.html`, eliminating 404 routing errors.

---

## Data Storage & Backup Advice

- **Where is data saved?** Data is saved securely in your browser's `localStorage` sandbox under the key `leadcatch_app_data_v1`.
- **Do I need an account or credit card?** No. Everything runs client-side with zero cost.
- **Cross-Device Sync:** Because data is stored in the browser, changes on a phone do not automatically sync to a laptop without transferring a backup file.
- **Best Practice:** Navigate to **Settings & Data** > **Export Data (JSON)** once a week or before clearing browser cookies to keep an offline backup of all your customer records.

---

## Project Structure

```
LeadCatch/
├── index.html                   # HTML entry point with synchronized meta tags
├── metadata.json                # Project capabilities and applet metadata
├── package.json                 # Declared dependencies and npm build scripts
├── project-manifest.json        # Machine-readable specifications and file inventory
├── QA_REPORT.md                 # Complete verification report and test results
├── README.md                    # Installation, development, and deployment guide
├── tsconfig.json                # TypeScript compiler configuration
├── vercel.json                  # SPA rewrite rules and HTTP security headers
├── vite.config.ts               # Vite configuration and path aliases
└── src/
    ├── App.tsx                  # Root state orchestration, tabs, and modals
    ├── main.tsx                 # React DOM mount point
    ├── index.css                # Tailwind CSS v4 imports and print utilities
    ├── types/
    │   └── index.ts             # TypeScript interfaces for leads, quotes, profile
    ├── utils/
    │   ├── demoData.ts          # Realistic home-service initial dataset
    │   ├── formatters.ts        # Currency, date, WhatsApp, and mailto helpers
    │   ├── storage.ts           # LocalStorage wrapper, validator, JSON import/export
    │   └── templates.ts         # 5 home-service outreach message generators
    └── components/
        ├── ConfirmDialog.tsx    # Accessible confirmation modal for destructive actions
        ├── DashboardView.tsx    # Executive pipeline and revenue KPI dashboard
        ├── FollowUpAssistantView.tsx # Outreach generator with WhatsApp/Mailto links
        ├── LeadModal.tsx        # Add and edit lead modal with comprehensive validation
        ├── LeadsView.tsx        # High-density CRM data table with search and filters
        ├── Navbar.tsx           # Universal 3-zone Top Bar Contract navigation
        ├── QuoteModal.tsx       # Itemized quote builder with dynamic line items
        ├── QuotePrintPreview.tsx# Printable invoice/quote document for browser PDF printing
        ├── QuotesView.tsx       # Quotes management table and status workflow
        ├── ReportsView.tsx      # Win rate, pipeline vs won cash, and source reports
        ├── SettingsDataView.tsx # Profile customization, JSON backup/restore, reset
        └── Toast.tsx            # Non-blocking user feedback notifications
```

---

## License

This project is licensed under the Apache-2.0 License.
