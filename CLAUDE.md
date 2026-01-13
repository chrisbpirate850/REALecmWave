# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emerald Coast Marketing Wave is a Next.js 16 application for a shared postcard advertising platform. Local businesses purchase ad spots on 9x12 postcards mailed via USPS Every Door Direct Mail to the Emerald Coast area (Niceville, Fort Walton Beach, Navarre, Gulf Breeze). The platform provides QR code tracking and analytics for measuring campaign performance.

**Production URL:** https://ecmwave.com
**GitHub Repository:** https://github.com/chrisbpirate850/REALecmWave

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint code
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router and React 19
- **Database/Auth**: Supabase (PostgreSQL with Row Level Security)
- **Payments**: Stripe (live mode - checkout sessions + webhooks)
- **Styling**: Tailwind CSS 4 with shadcn/ui (new-york style)
- **Deployment**: Vercel with Analytics

### Directory Structure
```
emerald-coast-marketing-wave/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout session creation
│   │   ├── custom-checkout/  # Admin custom pricing checkout
│   │   ├── webhooks/stripe/  # Stripe webhook handler
│   │   └── upload-ad-copy/   # File upload endpoint
│   ├── admin/             # Admin panel (role-protected)
│   │   ├── mailings/      # Mailing management
│   │   ├── spots/         # Ad spots management
│   │   ├── payments/      # Payment history with CSV export
│   │   ├── users/         # User management
│   │   ├── blog/          # Blog post management
│   │   └── custom-checkout/  # Custom pricing link generator
│   ├── auth/              # Authentication pages (login, sign-up)
│   ├── blog/              # Public blog listing and posts
│   ├── dashboard/         # Protected user dashboard
│   ├── mailings/          # Public mailing listings
│   ├── offers/[slug]/     # Dynamic QR code landing pages
│   └── checkout/          # Checkout flow pages
├── components/
│   ├── admin/             # Admin-specific components
│   │   └── admin-sidebar.tsx
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   │   ├── client.ts      # Browser client
│   │   └── server.ts      # Server client (uses cookies)
│   ├── stripe.ts          # Stripe server-only instance
│   └── utils.ts           # cn() utility for className merging
└── hooks/                 # Custom React hooks
```

### Supabase Data Model
The database includes these core tables (managed via Supabase dashboard):
- `profiles` - User business profiles linked to Supabase Auth (includes `is_admin` boolean)
- `mailings` - Postcard mailing campaigns with status and dates
- `ad_spots` - Individual ad positions on postcards (6 per mailing)
- `landing_pages` - QR code destination pages with offer details
- `analytics` - QR scan tracking data
- `payments` - Stripe payment records
- `blog_posts` - Blog content with title, slug, content, featured image

**Important Column Names:**
- `ad_spots.ad_copy_url` - Stores the uploaded artwork URL (NOT `artwork_url`)
- `ad_spots.landing_page_slug` - Links to the QR landing page

### Authentication Flow
- Supabase Auth with email/password
- Client components use `createClient()` from `@/lib/supabase/client`
- Server components use `await createClient()` from `@/lib/supabase/server`
- Protected routes redirect unauthenticated users to `/auth/login`
- Admin routes check `profiles.is_admin` for access control

### Payment Flow
1. User selects spots on `/mailings/[id]`
2. POST to `/api/checkout` creates Stripe session and marks spots as "reserved"
3. Stripe redirects to `/checkout/success` on completion
4. `/api/webhooks/stripe` receives webhook, updates spots to "purchased", generates QR codes and landing pages

### Custom Checkout (Admin Feature)
Admins can generate payment links with negotiated/custom pricing:
1. Admin accesses `/admin/custom-checkout`
2. Selects mailing, available spot, enters advertiser email and custom price
3. POST to `/api/custom-checkout` creates Stripe session with custom amount
4. Generated URL is shared with advertiser for payment

### Path Aliases
Configured in `tsconfig.json`:
- `@/*` → `./*` (e.g., `@/components`, `@/lib`, `@/hooks`)

## Styling

### Theme Colors
Uses OKLCH color space with emerald accent colors defined in `app/globals.css`:
- Primary: emerald-600 (`oklch(0.533 0.157 166.504)`)
- Accent: emerald-100 (`oklch(0.906 0.062 166.155)`)
- Full dark mode support

### Component Library
- All UI components in `components/ui/` follow shadcn/ui patterns
- Use `cn()` from `@/lib/utils` for conditional className merging
- RSC (React Server Components) enabled in shadcn config

## Environment Variables

Required variables configured in Vercel and `.env.local`:

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side Supabase operations

**Stripe (Live Mode):**
- `STRIPE_PUBLISHABLE_KEY` - Live publishable key (pk_live_...)
- `STRIPE_SECRET_KEY` - Live secret key (sk_live_...)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (whsec_...)

**App:**
- `NEXT_PUBLIC_BASE_URL` - Production URL (https://ecmwave.com)

## Admin Panel

Access the admin panel at `/admin`. Requires `is_admin = true` in the `profiles` table.

### Admin Features
- **Dashboard** (`/admin`) - Overview stats and recent activity
- **Mailings** (`/admin/mailings`) - Create, edit, manage mailing campaigns
- **Ad Spots** (`/admin/spots`) - View and release ad spots across all mailings
- **Payments** (`/admin/payments`) - Payment history with CSV export
- **Users** (`/admin/users`) - User management and admin assignment
- **Blog** (`/admin/blog`) - Create and edit blog posts
- **Custom Checkout** (`/admin/custom-checkout`) - Generate payment links with custom pricing

### Making a User Admin
```sql
UPDATE profiles SET is_admin = true WHERE email = 'user@example.com';
```

## Production Configuration

### Stripe Account
- **Account ID:** `acct_1SmOx0PKFPtcK1nJ`
- **Webhook Endpoint:** `https://ecmwave.com/api/webhooks/stripe`
- **Webhook Events:** `checkout.session.completed`

### Deployment
Site is deployed on Vercel. Push to `main` branch triggers automatic deployment.

```bash
# Manual deployment
npx vercel --prod
```

## Important Notes

- `next.config.mjs` has `ignoreBuildErrors: true` for TypeScript - address type errors when possible
- Custom email templates for Supabase Auth are in `supabase-email-templates/`
- The project was generated with v0.dev, reflected in some console log prefixes (`[v0]`)
- Print export feature (`/admin/mailings/[id]/export`) uses JSZip for downloading artwork as ZIP

## Local Development

```bash
cd emerald-coast-marketing-wave
npm install
npm run dev

# In separate terminal - forward Stripe webhooks locally:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

For local Stripe testing, update `.env.local` with test keys (sk_test_... and pk_test_...).
