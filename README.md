# Lead Management System Automation Pipeline

Automates lead generation and CRM data entry using Playwright and TypeScript.

The pipeline:

1. Scrapes business data from Google Maps.
2. Visits business websites.
3. Extracts contact details and social links.
4. Stores leads in `output/gmblead.json`.
5. Imports leads into the target CRM.

---

## Data Flow

```text
Google Maps
    ↓
Lead Scraper
    ↓
Website Enrichment
    ↓
output/gmblead.json
    ↓
CRM Import
```

---

## Project Structure

```text
.
├── output/
│   └── gmblead.json
│
├── src/
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   └── LeadPage.ts
│   │
│   ├── services/
│   │   ├── scraperService.ts
│   │   ├── enrichmentService.ts
│   │   └── fileSystem.ts
│   │
│   └── types/
│       └── lead.types.ts
│
├── tests/
│   ├── scraperJob.spec.ts
│   └── leadImport.spec.ts
│
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .env
```

---

## Installation

```bash
npm install
npx playwright install chromium
```

---

## Environment Variables

Create a `.env` file:

```env
BASE_URL=http://localhost:3000

ADMIN_EMAIL=xyz@gmail.com
ADMIN_PASSWORD=xyz@123

MAX_RESULTS=2
```

---

## Commands

### Scrape Leads

```bash
npm run test:scrape
```

Generates:

```text
output/gmblead.json
```

### Import Leads

```bash
npm run test:import
```

Reads leads from `gmblead.json` and inserts them into the CRM.

### Run Complete Pipeline

```bash
npm run pipeline:run
```

### Debug Import Script

```bash
npx playwright test tests/leadImport.spec.ts --ui
```

---

## Sample Lead Object

```json
{
  "businessName": "ABC Technologies",
  "phone": "+91XXXXXXXXXX",
  "website": "https://xyz.com",
  "emails": ["info@xyz.com"],
  "facebook": "https://facebook.com/xyz",
  "instagram": "https://instagram.com/xyz",
  "linkedin": "https://linkedin.com/company/xyz"
}
```