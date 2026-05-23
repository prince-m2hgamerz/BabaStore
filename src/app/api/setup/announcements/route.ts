import { NextResponse } from "next/server";

const SQL = `
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "active announcements are public"
on public.announcements for select
using (is_active = true);

create policy "admins manage announcements"
on public.announcements for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create trigger announcements_set_updated_at
before update on public.announcements
for each row execute function set_updated_at();
`.trim();

export async function POST() {
  const managementKey = process.env.SUPABASE_MANAGEMENT_API_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return NextResponse.json(
      { ok: false, error: "NEXT_PUBLIC_SUPABASE_URL is not set" },
      { status: 500 }
    );
  }

  const ref = url.replace(/https?:\/\//, "").replace(/\.supabase\.co.*/, "");

  if (!ref) {
    return NextResponse.json(
      { ok: false, error: "Could not extract project ref from SUPABASE_URL" },
      { status: 500 }
    );
  }

  if (!managementKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "SUPABASE_MANAGEMENT_API_KEY is not set",
        sql: SQL,
        hint:
          "Create a management API key at https://supabase.com/dashboard/account/tokens " +
          "with 'SQL' scope, then add SUPABASE_MANAGEMENT_API_KEY=<key> to your .env file."
      },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${ref}/database/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${managementKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: SQL })
      }
    );

    const body = res.ok ? null : (await res.text()) || "unknown";
    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Management API error (${res.status}): ${body}`,
          sql: SQL,
          hint: "Run the SQL above manually in your Supabase SQL Editor."
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), sql: SQL },
      { status: 500 }
    );
  }
}
