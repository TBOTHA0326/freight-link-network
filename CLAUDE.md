# Freight Link Network — CLAUDE.md
> Last updated: 2026-03-26 — Rewritten from scratch with accurate project state. Always follow this file exactly.

---

## 1. Project Overview

Freight Link Network is a South African B2B logistics platform connecting **transporters** and **suppliers**.

- **Suppliers** post freight loads, manage their company profile, upload compliance documents, and track load statuses.
- **Transporters** browse and accept loads, manage their fleet (trucks, trailers, drivers), upload fleet documents, and track jobs.
- **Admins** manage the entire platform: approve/reject registrations, review company documents, activate accounts, manage loads, and view platform-wide statistics.

The platform targets the South African market with SA-specific business rules (CIPC certificates, PDP licenses, tax clearance, cross-border haulage), but cross-border loads to Namibia, Zimbabwe, Mozambique, Botswana, Lesotho, and Eswatini are supported.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router, TypeScript strict mode) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Styling | Tailwind CSS v4 (configured via `@theme inline` in `globals.css`) |
| Animations | Framer Motion v12 |
| Maps | Mapbox GL JS v3 + `@mapbox/mapbox-gl-geocoder` |
| Icons | Lucide React (never use any other icon library) |
| Email | Custom SMTP via Supabase Edge Function `send-email` (uses `npm:nodemailer@6`) |
| Deployment | Vercel |
| Font | Geist (configured in `app/layout.tsx`, variables: `--font-geist-sans`, `--font-geist-mono`) |

### Package versions (exact, from `package.json`)
```json
"next": "16.2.1",
"react": "19.2.4",
"@supabase/ssr": "^0.9.0",
"@supabase/supabase-js": "^2.100.0",
"framer-motion": "^12.38.0",
"lucide-react": "^1.6.0",
"mapbox-gl": "^3.20.0",
"tailwindcss": "^4"
```

---

## 3. UI Design — MANDATORY RULES

### Brand Colors — NEVER change these

Tailwind v4 colors are defined via `@theme inline` in `app/globals.css`:

| CSS variable | Hex | Usage |
|---|---|---|
| `--color-primary-blue` | `#06082C` | Sidebar bg, nav, primary buttons, headings, accents |
| `--color-primary-blue-hover` | `#0a0e40` | Hover state for primary blue |
| `--color-primary-red` | `#9B2640` | Destructive actions, avatar backgrounds, highlights |
| `--color-primary-red-hover` | `#7d1e33` | Hover state for primary red |

Use Tailwind utilities directly: `bg-[#06082C]`, `text-[#9B2640]`, `hover:bg-[#0a0e40]`. Or use the CSS variable token: `bg-primary-blue`.

Standard gray scale: `gray-50` (#F9FAFB) / `gray-100` (#F3F4F6) / `gray-400` (#9CA3AF) / `gray-500` (#6B7280) / `gray-700` (#374151) / `gray-900` (#111827).

### Custom Animations (defined in `app/globals.css`)
```css
.animate-fade-in        /* opacity 0->1, translateY 8px->0, 0.4s ease-out */
.animate-slide-up       /* opacity 0->1, translateY 24px->0, 0.5s ease-out */
.animate-slide-in-right /* opacity 0->1, translateX 24px->0, 0.4s ease-out */
.animate-pulse-slow     /* opacity 1->0.6->1, 2s infinite */
```

### Design Aesthetic

- **Sidebar navigation**: dark `#06082C` background, white text and icons, subtle hover state
- **Content area**: white card-based layout, `border border-gray-100`, `rounded-xl` or `rounded-2xl`, minimal `shadow-sm`
- **Buttons**: primary = `bg-[#06082C] text-white hover:bg-[#0a0e40]`, destructive = `bg-red-600 text-white`, secondary = `border border-gray-200 text-gray-700`
- **Status badges**: always use `StatusBadge` component — never write inline status pill logic
- **Empty states**: always use `EmptyState` component
- **Page headers**: always use `PageHeader` component
- **Section cards**: always use `SectionCard` component
- **Stat/KPI cards**: use `StatCard` component on dashboards
- All interactive elements: `rounded-lg`, `transition-colors`, `focus:outline-none focus:ring-2 focus:ring-[#06082C]`
- Page entry: `animate-fade-in`; cards: `animate-slide-up`
- Tables: `thead` with `border-b border-gray-100`, rows with `hover:bg-gray-50 divide-y divide-gray-50`
- Mapbox logo/attribution hidden via `globals.css`

---

## 4. Project File Structure

```
app/
├── layout.tsx                           # Root layout: Geist font, AuthProvider, globals.css
├── globals.css                          # Tailwind v4 @theme inline, custom animations
├── page.tsx                             # Public landing page
├── login/page.tsx                       # Email + password login
├── register/
│   ├── page.tsx                         # Step 1: Choose role, Step 2: Personal details + password
│   ├── pending/page.tsx                 # Legacy "waiting for admin approval" holding screen
│   ├── review-pending/page.tsx          # "Onboarding submitted, waiting for activation" screen
│   └── rejected/page.tsx               # Registration rejected screen with reason
├── forgot-password/page.tsx
├── reset-password/page.tsx
├── onboarding/page.tsx                  # Multi-step company setup (Step 1: info, Step 2: documents)
├── auth/
│   ├── confirm/route.ts
│   ├── callback/route.ts
│   └── error/page.tsx
├── dashboard/
│   ├── supplier/
│   │   ├── layout.tsx                   # Sidebar layout guard (role=supplier, status=active)
│   │   ├── page.tsx                     # Supplier dashboard: stats, recent loads
│   │   ├── loads/page.tsx               # My loads list with status filters
│   │   ├── loads/new/page.tsx           # Post a new load
│   │   ├── loads/[id]/edit/page.tsx     # Edit an existing load
│   │   ├── company/page.tsx             # Company profile + document uploads
│   │   └── map/page.tsx                 # Interactive load map (own loads)
│   └── transporter/
│       ├── layout.tsx                   # Sidebar layout guard (role=transporter, status=active)
│       ├── page.tsx                     # Transporter dashboard: fleet stats, available loads
│       ├── loads/page.tsx               # Browse available (approved) loads
│       ├── trucks/page.tsx              # Fleet truck management
│       ├── trailers/page.tsx            # Fleet trailer management
│       ├── drivers/page.tsx             # Fleet driver management
│       ├── company/page.tsx             # Company profile + document uploads
│       └── map/page.tsx                 # Interactive load map (approved loads)
└── admin/
    ├── layout.tsx                       # Sidebar layout guard (role=admin)
    ├── page.tsx                         # Redirect to /admin/dashboard
    ├── dashboard/page.tsx               # Admin overview: KPI stats, recent activity
    ├── approvals/page.tsx               # Pending registrations + setup submissions
    ├── loads/page.tsx                   # All loads with review actions
    ├── loads/new/page.tsx               # Admin: create load on behalf of supplier
    ├── suppliers/page.tsx               # All supplier companies list
    ├── suppliers/[id]/page.tsx          # Supplier detail: docs, loads, activate account
    ├── transporters/page.tsx            # All transporter companies list
    ├── transporters/[id]/page.tsx       # Transporter detail: fleet, docs, activate account
    ├── users/page.tsx                   # All users with role/status filters
    ├── map/page.tsx                     # Platform-wide load map
    └── settings/page.tsx               # Admin settings

components/
├── AuthProvider.tsx    # Global auth context + useAuth() hook
├── Sidebar.tsx         # Role-aware sidebar navigation
├── PageHeader.tsx      # Page title + icon + optional action slot
├── SectionCard.tsx     # White rounded card with title/subtitle
├── StatusBadge.tsx     # Status pill component
├── EmptyState.tsx      # Empty list placeholder
├── StatCard.tsx        # KPI/stat card for dashboards
├── ProgressRing.tsx    # Circular progress indicator (SVG)
├── StepIndicator.tsx   # Multi-step form progress bar
├── ConfirmModal.tsx    # Confirmation dialog (yes/no)
├── AddressAutocomplete.tsx  # Mapbox address search input
├── LoadMap.tsx         # Mapbox interactive map component
├── LoadingSpinner.tsx  # Full-page loading spinner
├── Navbar.tsx          # Top navigation bar (public pages)
└── Footer.tsx          # Public page footer

database/
├── types.ts            # ALL TypeScript types — single source of truth
└── queries/
    ├── auth.ts         # signIn, signUp, signOut, getSession, getCurrentUser, getProfile, updateProfile, sendPasswordResetEmail, updatePassword
    ├── companies.ts    # getCompany, createCompany, updateCompany, getCompanyWithOwner
    ├── documents.ts    # getDocumentsByCompany, uploadDocument, reviewDocument, getDocumentUrl, deleteDocument
    ├── loads.ts        # getLoads, getLoadById, getLoadsByCompany, getApprovedLoads, createLoad, updateLoad, deleteLoad, getMapLoads
    ├── trucks.ts       # getTrucks, createTruck, updateTruck, deleteTruck
    ├── trailers.ts     # getTrailers, createTrailer, updateTrailer, deleteTrailer
    ├── drivers.ts      # getDrivers, createDriver, updateDriver, deleteDriver
    └── registrations.ts  # getPendingRegistrations, getSetupSubmissions, approveRegistration, rejectRegistration, activateUser, getAllUsers, getAdminDashboardStats

lib/
├── supabaseClient.ts   # createBrowserClient singleton — exports `supabase` and `getSupabaseClient()`
├── supabaseServer.ts   # createSupabaseServerClient() — server-only, used in auth callback routes ONLY
├── mapbox.ts           # geocodeAddress(), reverseGeocode(), searchAddresses()
└── email.ts            # Email notification helpers (all fire-and-forget)

supabase/
├── functions/send-email/index.ts        # SMTP Edge Function using npm:nodemailer@6
└── migrations/
    ├── 0001_enums.sql         # 6 enums
    ├── 0002_tables_core.sql   # All 9 tables (clean defaults from day 1)
    ├── 0003_rls_policies.sql  # is_admin() + all RLS policies
    ├── 0004_functions.sql     # All functions + triggers (all SECURITY DEFINER SET search_path = public)
    ├── 0005_storage.sql       # documents storage bucket + storage RLS
    ├── 0006_seed_admin.sql    # Instructions: create admin in Auth, then run UPDATE
    └── 0007-0013 (no-ops)    # Legacy patches — consolidated into 0001-0006. Safe to skip or run.
    # Next migration: 0014_description.sql
```

---

## 5. Database Setup — Fresh Project

Run migrations **in order** in Supabase SQL Editor:

1. `0001_enums.sql`
2. `0002_tables_core.sql`
3. `0003_rls_policies.sql`
4. `0004_functions.sql`
5. `0005_storage.sql`
6. `0006_seed_admin.sql` (read the comment inside — create user first, then run the UPDATE)

Files 0007–0013 are no-ops — skip them or run them safely (they do nothing).

### Creating the admin user (after migrations 0001–0005)

1. **Supabase Dashboard → Authentication → Users → Add user** → fill email + password
2. The `handle_new_user` trigger auto-creates the profile row
3. Copy the UUID from the users list
4. In SQL Editor:
```sql
UPDATE profiles
SET role = 'admin', registration_status = 'active'
WHERE id = 'PASTE-UUID-HERE';
```

---

## 6. Authentication & Registration Flow

### Roles

| Role | Description |
|---|---|
| `transporter` | Trucking company — manages fleet, accepts loads |
| `supplier` | Freight owner — posts loads, manages company docs |
| `admin` | Platform administrator — full management access |

### Registration Status Lifecycle

```
[User registers via /register]
        |
        v
 approved_pending_setup    <- handle_new_user() trigger inserts this directly
        |
        v  (user logs in, completes /onboarding)
 pending_final_approval
        |
        v  (admin reviews docs, clicks Activate Account)
      active               <- sendAccountActivated() fires here
        |
        (any status -> rejected if admin rejects)
```

> `pending_admin_approval` still exists in the enum for legacy DB rows but new users NEVER start there. `approve_registration()` RPC is kept only for legacy rows.

### Login Page Routing Logic

```typescript
if (status === 'approved_pending_setup')  -> router.push('/onboarding')
if (status === 'pending_final_approval')  -> router.push('/register/review-pending')
if (status === 'rejected')                -> router.push('/register/rejected')
// status === 'active':
if (role === 'admin')       -> router.push('/admin/dashboard')
if (role === 'supplier')    -> router.push('/dashboard/supplier')
if (role === 'transporter') -> router.push('/dashboard/transporter')
```

### Onboarding Flow (`/onboarding`)

**Step 1 — Company Information:**
- Company name, registration number, tax number
- Address (Mapbox autocomplete), city, province, postal code, country
- Phone, email, website, does_cross_border checkbox
- On "Next": creates company record, updates profile `company_id`, fires `refreshProfile()` fire-and-forget

**Step 2 — Document Upload:**
- Upload compliance documents (CIPC, tax clearance, ID, etc.)
- Stored in bucket `documents`, path: `{company_id}/{category}/{uuid}.{ext}`
- On "Submit": sets `registration_status = 'pending_final_approval'`, fires `refreshProfile()` fire-and-forget, redirects to `/register/review-pending`

### Admin Activation Workflow

```
1. [New user registers] -> status: approved_pending_setup (trigger fires automatically)
2. [User logs in] -> redirected to /onboarding
3. [User completes onboarding] -> status: pending_final_approval
4. [Admin] opens /admin/approvals -> sees "Setup Submissions" tab
5. [Admin] clicks "Review & Activate" -> goes to /admin/transporters/[id] or /admin/suppliers/[id]
6. [Admin] reviews each uploaded document -> approves or rejects each
7. [Admin] clicks "Activate Account" -> status: active -> sendAccountActivated() fires
8. [User logs in] -> routed to their dashboard
```

**Critical**: "Activate Account" button ONLY appears on the company detail pages — not on the approvals list. This forces document review before activation.

---

## 7. Complete Database Schema

### `profiles`
```sql
id                       UUID PK -> auth.users(id) ON DELETE CASCADE
email                    TEXT NOT NULL
full_name                TEXT
phone                    TEXT
role                     user_role NOT NULL DEFAULT 'transporter'
registration_status      registration_status NOT NULL DEFAULT 'approved_pending_setup'
company_id               UUID -> companies(id) ON DELETE SET NULL
rejection_reason         TEXT
registration_approved_at TIMESTAMPTZ
setup_completed_at       TIMESTAMPTZ
created_at / updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
```

### `companies`
```sql
id                  UUID PK DEFAULT gen_random_uuid()
name                TEXT NOT NULL
registration_number TEXT
tax_number          TEXT
address / city / province / postal_code  TEXT
country             TEXT NOT NULL DEFAULT 'South Africa'
phone / email / website  TEXT
company_type        user_role NOT NULL  -- 'transporter' or 'supplier'
does_cross_border   BOOLEAN NOT NULL DEFAULT false
is_verified         BOOLEAN NOT NULL DEFAULT false
created_at / updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
created_by          UUID -> auth.users(id)
```

### `loads`
```sql
id          UUID PK DEFAULT gen_random_uuid()
company_id  UUID -> companies(id) ON DELETE CASCADE  -- nullable: admin can post
title       TEXT NOT NULL
description / cargo_type / weight_tons / contact_phone / internal_notes
-- Pickup:
pickup_address / city / province / country / lat(10,8) / lng(11,8) / place_id / date / time_window
-- Delivery:
delivery_address / city / province / country / lat / lng / place_id / date / time_window
required_trailer_type   trailer_type[]
budget_amount           DECIMAL(12,2)
special_instructions    TEXT
is_hazardous            BOOLEAN NOT NULL DEFAULT false
is_cross_border         BOOLEAN NOT NULL DEFAULT false
status                  load_status NOT NULL DEFAULT 'pending'
assigned_transporter_id UUID -> companies(id)
assigned_truck_id / assigned_driver_id  UUID
reviewed_by             UUID -> auth.users(id)
reviewed_at             TIMESTAMPTZ
rejection_reason        TEXT
created_at / updated_at / created_by
```

### `trucks`
```sql
id / company_id(NOT NULL) / registration_number(NOT NULL) / make / model / year
horse_type  TEXT
number_of_axles  INTEGER CHECK (BETWEEN 2 AND 6)
is_active(true) / is_verified(false)
created_at / updated_at / created_by
```

### `trailers`
```sql
id / company_id(NOT NULL) / registration_number(NOT NULL)
trailer_type  trailer_type NOT NULL
make / model / year / length_meters(6,2) / payload_capacity_tons(8,2)
is_active(true) / is_verified(false)
created_at / updated_at / created_by
```

### `drivers`
```sql
id / company_id(NOT NULL) / first_name(NOT NULL) / last_name(NOT NULL)
id_number / license_number / license_expiry / phone / email
is_active(true) / is_verified(false)
created_at / updated_at / created_by
```

### `documents`
```sql
id / company_id(NOT NULL) / truck_id / trailer_id / driver_id
category   document_category NOT NULL
title      TEXT NOT NULL
file_path  TEXT NOT NULL    -- {company_id}/{category}/{uuid}.{ext}
file_name  TEXT NOT NULL
file_url / file_size / mime_type
status     document_status NOT NULL DEFAULT 'pending'
reviewed_by / reviewed_at / rejection_reason / uploaded_by
created_at / updated_at
```

### `load_interests`
```sql
id / load_id(NOT NULL) -> loads / transporter_company_id(NOT NULL) -> companies
created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
UNIQUE(load_id, transporter_company_id)
```

### `admin_stats`
```sql
id / stat_date  DATE NOT NULL UNIQUE
new_transporters / new_suppliers / pending_approvals / total_loads / approved_loads  INTEGER DEFAULT 0
created_at / updated_at
```

---

## 8. Database Enums

```sql
user_role:           transporter | supplier | admin

registration_status: pending_admin_approval | approved_pending_setup |
                     pending_final_approval | active | rejected

load_status:         pending | approved | rejected | in_transit | completed | cancelled

document_status:     pending | approved | rejected

document_category:   registration | cipc | tax_document | id_document |
                     drivers_license | pdp | passport | truck_registration |
                     brake_test | roadworthy | trailer_registration | other

trailer_type:        tautliner | flatbed | lowbed | tanker | refrigerated |
                     container | side_tipper | end_tipper | other
```

---

## 9. Database Functions (RPC)

All called via `supabase.rpc('function_name', { params })`. All are `SECURITY DEFINER SET search_path = public`.

| Function | Signature | Description |
|---|---|---|
| `is_admin()` | `() -> BOOLEAN` | Checks if `auth.uid()` has role=admin. Used in all RLS policies. |
| `handle_new_user()` | trigger fn | Auto-creates profile on INSERT into auth.users. Sets `registration_status = 'approved_pending_setup'`, reads `role` from `raw_user_meta_data`. |
| `update_updated_at()` | trigger fn | Sets `updated_at = now()` on every UPDATE. Triggers on all 8 tables. |
| `approve_registration` | `(user_id UUID) -> profiles` | Legacy: `pending_admin_approval -> approved_pending_setup`. |
| `reject_registration` | `(user_id UUID, reason TEXT) -> profiles` | Any status -> `rejected`. |
| `activate_user` | `(user_id UUID) -> profiles` | `pending_final_approval -> active`, sets `setup_completed_at`. |
| `review_load` | `(load_id UUID, new_status load_status, reason TEXT DEFAULT NULL) -> loads` | Admin approve/reject load. |
| `review_document` | `(doc_id UUID, new_status document_status, reason TEXT DEFAULT NULL) -> documents` | Admin approve/reject doc. |
| `get_map_loads` | `(user_role_param TEXT, user_company_id UUID DEFAULT NULL) -> TABLE(...)` | Loads with lat/lng for map. LEFT JOINs companies. Filtered by role. |
| `get_admin_dashboard_stats` | `() -> JSON` | All KPI counts. |

### `get_admin_dashboard_stats()` JSON keys
```
total_users, pending_approvals, active_companies, total_loads,
pending_loads, approved_loads, in_transit_loads, completed_loads,
total_transporters, total_suppliers, pending_registrations, pending_setups
```

> **IMPORTANT**: Never use RPC return values to update local React state. `supabase.rpc()` may wrap the return in an array. Always update state directly after a mutation.

---

## 10. Row Level Security (RLS) Summary

RLS enabled on all tables. `is_admin()` SECURITY DEFINER bypasses all checks for admins.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Own row OR admin | Own row | Own row OR admin | — |
| `companies` | `created_by`=me OR admin | `created_by`=me OR admin | same | Admin only |
| `loads` | Own company OR admin OR status=`approved` | Own company OR admin | Own company OR admin | Own+pending/rejected OR admin |
| `trucks/trailers/drivers` | Own company OR admin | Own company | Own company OR admin | Own company OR admin |
| `documents` | Own company OR admin | Own company | Own company OR admin | Own company OR admin |
| `load_interests` | Own company OR admin | Own company | — | Own company |
| `admin_stats` | Admin only | Admin only | Admin only | Admin only |

Storage bucket `documents` (private): authenticated users can upload, read, and delete objects they own.

---

## 11. Email System

### Architecture
```
lib/email.ts -> supabase.functions.invoke('send-email', { body: { to, subject, html } })
                    |
                    v
        supabase/functions/send-email/index.ts
                    |
                    v
        SMTP server via npm:nodemailer@6
        (CORS handled, SMTP credentials from Deno.env)
```

### Required Edge Function Secrets
Set in **Supabase Dashboard -> Edge Functions -> send-email -> Secrets**:

```
SMTP_HOST     your mail server hostname
SMTP_PORT     587 (STARTTLS) or 465 (SSL/TLS)
SMTP_USER     noreply@freightlinknetwork.co.za
SMTP_PASS     your password
SMTP_FROM     Freight Link Network <noreply@freightlinknetwork.co.za>
```

### Deploy
```bash
npx supabase functions deploy send-email --project-ref YOUR_PROJECT_REF
```

### Email Helpers in `lib/email.ts`

| Function | When | Recipient |
|---|---|---|
| `sendRegistrationApproved(email, name)` | Admin approves legacy step-1 | Applicant |
| `sendRegistrationRejected(email, name, reason)` | Admin rejects registration | Applicant |
| `sendAccountActivated(email, name)` | Admin clicks "Activate Account" | Account owner |
| `sendSetupRejected(email, name, reason)` | Admin rejects setup/docs | Account owner |
| `sendLoadApproved(email, name, loadTitle)` | Admin approves a load | Supplier |
| `sendLoadRejected(email, name, loadTitle, reason)` | Admin rejects a load | Supplier |

All are fire-and-forget internally. Call without await:
```typescript
// Correct:
sendAccountActivated(owner.email, owner.full_name ?? owner.email);

// Never:
await sendAccountActivated(owner.email, owner.full_name ?? owner.email);
```

---

## 12. Supabase Auth — Critical Notes

### Supabase Client Singleton
- `lib/supabaseClient.ts` exports `supabase` — import this everywhere in client components and query files
- Uses `@supabase/ssr` `createBrowserClient` — session in **cookies**, not localStorage
- Never create another `createBrowserClient` instance in components

### Server Client (`lib/supabaseServer.ts`)
- `createSupabaseServerClient()` — async factory, uses `cookies()` from `next/headers`
- Use ONLY in server-side route handlers (e.g. `app/auth/callback/route.ts`, `app/auth/confirm/route.ts`)
- Never import in client components or `database/queries/` files — use `supabase` from `supabaseClient.ts` instead

### Web Lock (CRITICAL)
- `@supabase/auth-js` uses `navigator.locks.request()` to serialize `getSession()` calls
- Two concurrent `getSession()` calls causes one to queue indefinitely if the first stalls
- `AuthProvider.onAuthStateChange` fires `fetchProfile()` -> `getSession()` on SIGNED_IN
- Any other `getSession()` call at this moment will deadlock

### AuthProvider 8-Second Safety Timeout
If `loading` stays true for >8s, AuthProvider calls `signOut()` and clears state. This is a last resort.

### `refreshProfile()` Rules
```typescript
// Always fire-and-forget:
void refreshProfile().catch(() => {});

// Never await in any handler:
await refreshProfile();  // DEADLOCK RISK
```

### Never pre-signOut before signIn
```typescript
// Bad:
await supabase.auth.signOut({ scope: 'local' });
const data = await signIn(email, password);

// Good:
const data = await signIn(email, password);
```

### No Email Verification
Disabled in Supabase Auth settings. Do NOT add confirmation flows or check `email_confirmed_at`.

---

## 13. Document Upload System

- **Bucket**: `documents` (private — no public access)
- **Path**: `{company_id}/{document_category}/{uuid}.{ext}` — UUID generated via `crypto.randomUUID()`
- **Access**: signed URLs only (60-minute expiry via `createSignedUrl(filePath, 3600)`)
- **Upload**: `supabase.storage.from('documents').upload(path, file, { upsert: false })` then insert into `documents` table with `status: 'pending'`
- **Delete**: `deleteDocument(docId, filePath)` — removes from storage AND deletes DB record
- **Review**: admin uses `review_document` RPC; `reviewDocument()` in `documents.ts` returns `void` — always update local state directly after

### Document Category Labels
```typescript
export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  registration: "Registration",        cipc: "CIPC Certificate",
  tax_document: "Tax Document",         id_document: "ID Document",
  drivers_license: "Driver's Licence",  pdp: "PDP Certificate",
  passport: "Passport",                 truck_registration: "Truck Registration",
  brake_test: "Brake Test",             roadworthy: "Roadworthy",
  trailer_registration: "Trailer Registration",  other: "Other",
};
```

---

## 14. Mapbox Integration

- `components/LoadMap.tsx` — interactive map
- Default center: `[25.0, -29.0]` (South Africa), zoom 5
- Map style: `mapbox://styles/mapbox/streets-v12`
- Pickup marker: green; Delivery marker: red/blue
- `components/AddressAutocomplete.tsx` — address search input (uses `@mapbox/mapbox-gl-geocoder`)
- `get_map_loads()` RPC returns loads with coordinates populated

### `lib/mapbox.ts` functions

```typescript
geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null>
reverseGeocode(lat: number, lng: number): Promise<string | null>
searchAddresses(query: string): Promise<AddressSuggestion[]>
```

All geocoding calls are filtered to SA + cross-border countries: `country=ZA,NA,ZW,MZ,BW,LS,SZ`.

---

## 15. Key Reusable Components

### `PageHeader` props
```typescript
{ title: string; subtitle?: string; icon: LucideIcon; action?: React.ReactNode }
```

### `SectionCard` props
```typescript
{ title?: string; subtitle?: string; className?: string; children: React.ReactNode }
```

### `StatusBadge` props
```typescript
{ status: string; label?: string }
// Handles: pending | approved | rejected | active | in_transit | completed | cancelled
//          pending_admin_approval | approved_pending_setup | pending_final_approval
```

### `EmptyState` props
```typescript
{ icon: LucideIcon; title: string; message: string; action?: React.ReactNode }
```

### `StatCard` props
```typescript
{ label: string; value: number | string; icon: LucideIcon; color?: string; trend?: string }
```

### `ConfirmModal` props
```typescript
{ isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; destructive?: boolean }
```

### `StepIndicator` props
```typescript
{ steps: Array<{ label: string }>; currentStep: number }
```

---

## 16. TypeScript Types (`database/types.ts`)

Always import from `database/types.ts`. Never redeclare inline.

```typescript
import type {
  Profile, Company, Load, Truck, Trailer, Driver,
  DocumentRecord as Document,
  LoadInterest, AdminStats,
  UserRole, RegistrationStatus, LoadStatus, DocumentStatus,
  TrailerType, DocumentCategory,
  RegisterFormInput, CompanyFormInput, LoadFormInput,
  TruckFormInput, TrailerFormInput, DriverFormInput,
  DocumentUploadInput,
  ProfileWithCompany, CompanyWithDocuments,
  MapLoad, DashboardStats, AddressSuggestion,
} from '@/database/types';
```

> `DocumentRecord` avoids collision with the browser `Document` global. Always alias it.

Also exported from `database/types.ts`:
```typescript
export const SA_PROVINCES              // string[] of 9 SA provinces
export const DOCUMENT_CATEGORY_LABELS  // Record<DocumentCategory, string>
export const TRAILER_TYPE_LABELS       // Record<TrailerType, string>
```

---

## 17. Code Patterns & Conventions

### 1. Queries in `database/queries/` only
Never inline `supabase.from(...)` or `supabase.rpc(...)` in page components.

### 2. `useAuth()` for auth state
```typescript
const { user, profile, loading, refreshProfile, signOut } = useAuth();
```
Never access `supabase.auth` directly in components.

### 3. Local state after mutations — NEVER use RPC return value
```typescript
// Correct:
await reviewDocument(docId, 'approved');
setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'approved' } : d));

// Wrong — RPC may return array:
const updated = await reviewDocument(docId, 'approved');
setDocuments(prev => prev.map(d => d.id === docId ? updated : d));
```

### 4. `refreshProfile()` is fire-and-forget
```typescript
void refreshProfile().catch(() => {});
```

### 5. Error handling pattern
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);
  try {
    await doSomething();
    // update local state directly
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Something went wrong.');
  } finally {
    setLoading(false);
  }
};
```

### 6. Loading buttons pattern
```typescript
<button disabled={loading} className="... disabled:opacity-50">
  {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
  {loading ? 'Saving...' : 'Save'}
</button>
```

### 7. `useCallback` + `useEffect` for data fetching
```typescript
const fetchData = useCallback(async () => {
  setLoading(true);
  try {
    const data = await getMyData();
    setData(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [dependency]);

useEffect(() => { fetchData(); }, [fetchData]);
```

### 8. All SQL in migrations
```
supabase/migrations/0014_my_change.sql
```
Never edit existing migrations. After creating one, tell the user: **"Run this in the Supabase SQL editor."**

### 9. No test suite
`npm run lint` is the quality gate.

### 10. No traditional API routes
All data access through Supabase client + RLS. No Next.js `route.ts` handlers needed (auth callbacks already exist).

### 11. `"use client"` directive
All components using hooks or browser APIs need `"use client"` at the top.

---

## 18. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase public anon key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=  # Mapbox public token
NEXT_PUBLIC_SITE_URL=             # Full site URL (e.g. https://app.freightlinknetwork.co.za)
```

All `NEXT_PUBLIC_*` (browser-exposed). SMTP credentials live in Edge Function secrets only — never in `.env` files.

---

## 19. Database Migration Rules

1. ALL SQL in `supabase/migrations/` — never edit existing files
2. File naming: `NNNN_short_description.sql`
3. Prefer idempotent SQL (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`)
4. After creating: tell the user **"Run this in the Supabase SQL editor."**
5. Never auto-apply — user runs manually in Supabase dashboard

### TypeScript + Supabase Exclusion
`tsconfig.json` excludes the entire `supabase/` directory:
```json
"exclude": ["node_modules", "supabase"]
```
This is **required** — Deno Edge Functions use Deno-specific imports (`npm:nodemailer@6`, `https://deno.land/...`) that the TypeScript compiler cannot resolve. Never remove this exclusion.

---

## 20. South Africa Specifics

- **Provinces**: Gauteng, Western Cape, KwaZulu-Natal, Eastern Cape, Limpopo, Mpumalanga, North West, Free State, Northern Cape
- **Business docs**: CIPC certificate, tax clearance certificate, PDP (Professional Driving Permit)
- **Currency**: ZAR (R), e.g. `R 15 000`
- **Date format**: `en-ZA` locale (`new Date(x).toLocaleDateString('en-ZA')`)
- **Cross-border**: Namibia, Zimbabwe, Mozambique, Botswana, Lesotho, Eswatini
- **Truck axle configs**: 6x4 horse, tri-axle trailers, B-trains

---

## 21. Development Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm start        # Run production server
npm run lint     # ESLint + TypeScript check

# Supabase
npx supabase login
npx supabase functions deploy send-email --project-ref YOUR_PROJECT_REF
npx supabase functions serve send-email    # Local test
```

---

## 22. Known Issues & Fixes Applied

### Web Lock deadlock (loading loop / auto sign-out on refresh)
**Cause**: `await refreshProfile()` inside an `onAuthStateChange` handler competed for the auth Web Lock.
**Fix**: All `refreshProfile()` calls fire-and-forget: `void refreshProfile().catch(() => {})`.

### Document approval corrupts local state
**Cause**: RPC return value used to replace document in state. SDK wraps return in an array.
**Fix**: Always update state directly: `{ ...doc, status: newStatus }`.

### Onboarding "Saving..." infinite hang
**Cause**: `await refreshProfile()` in `handleStep1Next()` competed with the Web Lock.
**Fix**: Both `refreshProfile()` calls in onboarding are fire-and-forget.

### "Database error creating new user" in Supabase Auth dashboard
**Cause**: `handle_new_user()` SECURITY DEFINER function missing `SET search_path = public`.
**Fix**: All SECURITY DEFINER functions now have `SET search_path = public`. Column default is `'approved_pending_setup'`. Migrations 0001-0006 are the canonical clean setup — run them fresh on a new project.

---

## 23. Build Checklist (before deploying)

1. `npm run lint` — zero errors
2. `npm run build` — zero TypeScript errors
3. Migrations 0001-0006 applied in order on the Supabase project
4. Admin user created in Auth dashboard and promoted via SQL UPDATE
5. Supabase Auth: **email confirmations disabled**
6. SMTP secrets set in Edge Function secrets for `send-email`
7. `send-email` function deployed
8. `.env.local` has all 4 `NEXT_PUBLIC_*` variables filled in




Ok but tell me if I make the domain https://f-ln.co.za

What must I add like for the redirects?

Claude
For https://f-ln.co.za you need to update two places:

1. Supabase Auth — URL Configuration
Supabase Dashboard → Authentication → URL Configuration

Setting	Value
Site URL	https://f-ln.co.za
Redirect URLs	https://f-ln.co.za/**
The ** wildcard covers all your auth routes (/auth/callback, /auth/confirm, /reset-password, etc.) in one go.

2. Vercel env var
3. www redirect (optional but recommended)
In Vercel, when you add the domain, also add www.f-ln.co.za and set it to redirect to f-ln.co.za. Vercel handles this automatically in the domains settings — just add both and pick your primary.

That's it. The password reset emails and auth callbacks will all route correctly through /auth/confirm and /auth/callback which are already set up in your codebase.