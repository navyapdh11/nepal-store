# NEPAL STORE — Full Security, SEO, AEO, GEO & Performance Audit

**Date:** 2026-04-30
**Commit:** 0ce0ee5b

---

## Security Audit

### Authentication
- **JWT Library:** jsonwebtoken v9.0.3
- **Express secret:** `"nepal-store-secret"` (hardcoded in source)
- **Vercel secret:** `"nepal-store-secret-2026"` (hardcoded, different value)
- **Token payload:** `{ userId: string }` (7-char random string)
- **Token expiry:** 1h
- **Password handling:** Plaintext storage and comparison
- **No refresh tokens, no revocation, no logout**

### API Endpoints

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/auth/register` | None | In-memory user creation |
| POST | `/api/auth/login` | None | Plaintext password check |
| GET | `/api/products` | None | Static JSON read |

### Vulnerabilities
- Hardcoded secrets in committed source code
- `.env` file with `DATABASE_URL="file:./dev.db"` in git
- No CORS headers on Express server
- No rate limiting on any endpoint
- No input sanitization
- No CSRF protection
- `Math.random()` for user IDs (predictable)

---

## SEO Audit

### Meta Tags
- ❌ No `<meta name="description">`
- ❌ No Open Graph tags
- ❌ No Twitter Cards
- ❌ No canonical URLs
- ❌ No hreflang
- ✅ `<html lang="en">` — only English
- ✅ `<title>NEPAL STORE | LifeWear</title>` — static

### Crawlability
- ❌ SPA with no routing — all content at `/`
- ❌ Navigation via `<button>` and `<span>`, not `<a>` tags
- ❌ Footer links are `<span role="button">` — not crawlable
- ❌ Product cards are `<div onClick>` — not crawlable
- ❌ No sitemap.xml
- ❌ No robots.txt

### Content Quality
- ❌ All 450 products share identical description template
- ❌ No category descriptions
- ❌ No About page
- ❌ No FAQ section
- ❌ No blog or content hub
- ❌ No contact page

### Structured Data
- ❌ Zero JSON-LD
- ❌ No Product schema
- ❌ No Organization schema
- ❌ No BreadcrumbList
- ❌ No FAQPage schema

---

## AEO (Answer Engine Optimization) Audit

| Requirement | Status |
|-------------|--------|
| FAQ section with Q&A format | ❌ Missing |
| Conversational language | ❌ Enterprise jargon only |
| Featured snippet optimization | ❌ Not possible |
| "People Also Ask" targeting | ❌ Missing |
| How-to guides | ❌ Missing |
| Comparison content | ❌ Missing |
| Direct answer content | ❌ Missing |

---

## GEO (Generative Engine Optimization) Audit

| Requirement | Status |
|-------------|--------|
| Structured knowledge graph | ❌ Missing |
| Entity relationships | ⚠️ Data exists, no markup |
| Knowledge panels | ❌ Missing |
| E-E-A-T signals | ❌ Missing |
| Authoritative content | ❌ Missing |
| Entity disambiguation | ❌ Missing |
| SameAs links | ❌ Missing |

---

## Performance Audit

### Bundle
- No code splitting
- No React.lazy()
- Only Suspense on Remotion Player
- Estimated 500-700 KB initial bundle
- Heavy dependencies: framer-motion, remotion, lucide-react

### Images
- All from `images.unsplash.com` with `w=800`
- `loading="lazy"` on product cards ✅
- No `<picture>` or `<source>` elements
- No width/height attributes (causes CLS)
- No srcset for responsive images

### Data Loading
- Products: `fs.readFileSync` blocks event loop at startup
- Products JSON: 11,703 lines, ~225 KB
- No service worker, no caching beyond API `s-maxage`

### Remotion
- Video hero composition — heavy for a banner
- Loads full video player on page load

---

## Accessibility Audit

### Pass
- ✅ `role="dialog"`, `aria-modal="true"` on ProductModal
- ✅ `aria-label` on search and cart buttons
- ✅ `aria-label="Close Modal"` on close button
- ✅ `aria-expanded`, `aria-haspopup="true"` on MegaMenu
- ✅ `role="menu"`, `role="menuitem"` on dropdown
- ✅ Form inputs have `htmlFor`/`id` labels
- ✅ Product images have `alt={product.name}`

### Fail
- ❌ No skip-to-content link
- ❌ No focus trap in modal
- ❌ No Escape key handler for modal
- ❌ Footer clickable spans should be `<button>` elements
- ❌ No `aria-live` for dynamic content (nudges, cart)
- ❌ Navigation tabs have no `aria-selected`
- ❌ No keyboard navigation for color swatches or size buttons
- ❌ No `aria-busy` during product loading

---

## Database Audit

### Prisma Schema (4 models)
| Model | Fields | Relations | Indexes |
|-------|--------|-----------|---------|
| User | id, email, name, role, createdAt | None | email @unique |
| SanitizationLog | id, createdAt, sector, location, technicianId, status, throughputMetrics | None | None |
| AuditTrail | id, timestamp, action, userId, details | None | None |
| PricingMatrix | id, tier, sector, price | None | None |

### Issues
- **NEVER USED** — zero PrismaClient imports
- No relations between any models
- No enums (all status/role fields are String)
- No indexes beyond email unique
- Schema declares PostgreSQL but `.env` uses SQLite

### Actual Data Storage
- Products: `public/products.json` (static file)
- Users: in-memory array (Express) or none (Vercel)
- No persistence across restarts

---

## npm Audit: 15 Vulnerabilities

| Severity | Package | Issue |
|----------|---------|-------|
| HIGH | minimatch 9.0.0-9.0.6 | ReDoS via glob patterns |
| HIGH | path-to-regexp 4-6 | Backtracking regex |
| HIGH | tar <=7.5.10 | Path traversal via hardlinks |
| HIGH | undici <=6.23.0 | DoS, CRLF injection, smuggling |
| MODERATE | ajv 7-8 | ReDoS with `$data` option |
| MODERATE | esbuild <=0.24.2 | Dev server request smuggling |

---

*Last updated: 2026-04-30*
