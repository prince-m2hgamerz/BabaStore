# BabaStore Phase 1 Setup

## Environment

Copy `.env.example` to `.env.local` and fill:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL="BabaSwift AppStore <noreply@your-domain.com>"
```

## Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. In Authentication settings, enable email/password.
4. Set email confirmation and reset redirect URLs to:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/reset-password`
5. For production, replace localhost URLs with the Vercel domain.

## Roles

New users can register as `user` or `developer`.
Admins should be promoted manually in Supabase:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

## Phase Status

Phase 1 includes:

- Next.js App Router foundation
- Dark glass design system
- Supabase auth actions
- Protected route middleware
- User, developer, and admin route guards
- Initial schema and RLS policies

R2 uploads, APK downloads, catalog browsing, and analytics begin in later phases.

