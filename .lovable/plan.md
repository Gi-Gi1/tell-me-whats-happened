## AgriAid Auth + Role-Based Access — Implementation Plan

### 1. Database (migration)
- `app_role` enum: `farmer | buyer | trader | agribusiness | student | officer | admin`
- `profiles` table: `id (uuid → auth.users)`, `display_name`, `phone`, `region`, `language`, `created_at`
- `user_roles` table: `(user_id, role)` unique; one primary role per user (enforced via partial unique index on `is_primary = true`)
- Security definer `has_role(_user_id, _role)` + `get_primary_role(_user_id)` functions
- Trigger `on_auth_user_created` → auto-create profile + default `farmer` role if none provided
- RLS:
  - `profiles`: owner read/update; public read of display_name only via view (skip for now — own row only)
  - `user_roles`: user reads own roles; service_role manages
  - `crop_listings` (already implied by AgriMarket): farmers can insert their own; buyers/traders/agribusiness/officer can SELECT; owner can update/delete
- GRANTs for `authenticated` + `service_role` on all new tables

### 2. Supabase Auth config
- Disable email confirmation via `supabase/config.toml` (`[auth.email] enable_confirmations = false`)

### 3. Auth client utilities
- `src/hooks/useAuth.tsx` — context provider: session, user, primaryRole, loading, signIn/signUp/signOut
- `signUp` accepts `{ email, password, displayName, role }` → creates user → inserts into `user_roles` → session active immediately (no email step)
- Subscribe to `onAuthStateChange` (filter SIGNED_IN/OUT/USER_UPDATED) and invalidate router
- Wire provider in `__root.tsx` inside QueryClientProvider

### 4. Routes
- `/auth` — public, tabs: Sign In | Sign Up (with role selector grid)
- `/auth/select-role` — fallback if no role on profile
- `_authenticated/route.tsx` — managed gate, ssr:false, redirects to `/auth`
- Move existing `dashboard.*` files under `_authenticated/dashboard.*`
- `_authenticated/dashboard.index.tsx` — auto-redirects to role's dashboard via `routeForRole`
- Each role dashboard checks role match; if mismatched redirects to own dashboard

### 5. Dynamic UI
- `AgriNav` reads `primaryRole`, shows role-specific menu items + role badge + logout
- Landing `/` shows sign-in CTA if not authenticated, dashboard link if authenticated

### 6. Role-based data filtering
- Helper `useRole()` for components
- Server-side enforced by RLS on listings table
- Frontend hides actions (e.g. "Post crop" only visible to farmer/agribusiness)

### 7. Logout
- `signOut` → cancel queries → clear cache → `navigate('/', replace:true)`

### 8. i18n (lightweight)
- `src/lib/i18n.ts` — simple dict `{ my, en }`, persisted lang in localStorage; toggle in nav
- All role labels translated via `ROLE_META` (already has `my`/`en`)

### Files to create
- `supabase/migrations/<ts>_agriaid_auth_roles.sql`
- `src/hooks/useAuth.tsx`
- `src/lib/i18n.tsx`
- `src/routes/auth.tsx`
- `src/routes/_authenticated/route.tsx`
- `src/routes/_authenticated/dashboard.index.tsx`
- Move dashboard.{farmer,buyer,trader,agribusiness,student,officer}.tsx → under `_authenticated/`
- Update `AgriNav.tsx`, `__root.tsx`, landing `/` CTA

### Notes
- No email confirmation = instant login as required
- Role fixed after signup (no UI to change)
- Default fallback role = farmer (via trigger)
- Officer requires manual admin promotion in v1 (anyone can self-select for demo; flag in plan if user wants gating)

Ready to implement. Confirm to proceed.