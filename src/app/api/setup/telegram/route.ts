import { NextResponse } from "next/server";

const SQL = `
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
create table if not exists public.telegram_automations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  trigger_type text not null default 'all' check (trigger_type in ('all', 'keyword', 'regex')),
  trigger_pattern text,
  reply_style text not null default 'concise' check (reply_style in ('concise', 'detailed', 'friendly', 'professional')),
  max_tokens int not null default 150,
  temperature float not null default 0.5,
  allowed_chat_ids text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.telegram_chat_logs (
  id uuid primary key default gen_random_uuid(),
  chat_id text not null,
  message_id bigint,
  direction text not null check (direction in ('incoming', 'outgoing')),
  text text not null,
  reply text,
  automation_id uuid references public.telegram_automations(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.telegram_automations enable row level security;
alter table public.telegram_chat_logs enable row level security;

create policy "admins manage telegram automations"
on public.telegram_automations for all
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "admins read telegram logs"
on public.telegram_chat_logs for select
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "service role can insert telegram logs"
on public.telegram_chat_logs for insert
with check (true);

create trigger telegram_automations_set_updated_at
before update on public.telegram_automations
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
