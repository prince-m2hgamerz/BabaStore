<div align="center">
  <br/>
  <img src="https://pub-b9be931af9f8492ca6f5b94fc150a9c2.r2.dev/babastore-logo.png" alt="BabaStore" width="80" height="80" style="border-radius:16px"/>
  <h1 align="center">BabaStore</h1>
  <p align="center">
    <strong>Open Android App Marketplace.</strong>
    <br/>
    Browse, install, review, and publish Android APKs — free and open.
  </p>
  <p align="center">
    <a href="https://baba-store.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/Live-Demo-171717?style=for-the-badge&logo=vercel" alt="Live Demo"/>
    </a>
    <a href="https://github.com/prince-m2hgamerz/BabaStore/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-ffd33d?style=for-the-badge" alt="MIT License"/>
    </a>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=nextdotjs" alt="Next.js 15"/>
    </a>
    <a href="https://supabase.com/">
      <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    </a>
  </p>
  <p align="center">
    <a href="https://github.com/prince-m2hgamerz/BabaStore/stargazers">
      <img src="https://img.shields.io/github/stars/prince-m2hgamerz/BabaStore?style=for-the-badge&logo=github" alt="Stars"/>
    </a>
    <a href="https://github.com/prince-m2hgamerz/BabaStore/issues">
      <img src="https://img.shields.io/github/issues/prince-m2hgamerz/BabaStore?style=for-the-badge&logo=github" alt="Issues"/>
    </a>
    <a href="https://github.com/prince-m2hgamerz/BabaStore/network">
      <img src="https://img.shields.io/github/forks/prince-m2hgamerz/BabaStore?style=for-the-badge&logo=github" alt="Forks"/>
    </a>
  </p>
  <br/>
  <p align="center">
    <a href="https://github.com/sponsors/prince-m2hgamerz">
      <img src="https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-ff69b4?style=for-the-badge&logo=githubsponsors" alt="GitHub Sponsors"/>
    </a>
    <a href="https://www.buymeacoffee.com/prince_m2hgamerz">
      <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black" alt="Buy me a coffee"/>
    </a>
  </p>
  <br/>
</div>

---

## ✨ Features

### 📱 For Users

| Feature | Description |
|---|---|
| 🔍 **Browse & Search** | Full-text search across thousands of apps from the BabaStore feed catalog plus local Supabase listings. Filter by category, rating, size, and last updated. |
| 📄 **App Details** | Screenshot gallery, version history, ratings, reviews, developer info, and direct APK download via a logged download endpoint. |
| ⭐ **Wishlist** | Save apps to a personal wishlist to install later. |
| 💬 **Ratings & Reviews** | Rate apps 1–5 stars and write public reviews. Developers can respond to feedback. |
| 🏆 **Top Charts** | Most-downloaded apps ranked 1–10 with install buttons. |
| ✨ **Editor's Choice** | Curated high-rated picks by the BabaStore team. |
| 🆕 **New Releases** | Latest app uploads sorted by version date. |

### 🛠️ For Developers

| Feature | Description |
|---|---|
| 📦 **APK Upload** | Upload APK files directly through the developer console with automatic Cloudflare R2 storage. |
| ✏️ **App Metadata** | Manage name, description, icon, screenshots, category, privacy policy URL. |
| 📊 **Analytics** | Per-app download counts and install statistics. |
| 🤖 **AI Descriptions** | Generate app descriptions using **NVIDIA NIM** or **Google Gemini** AI with content safety filters. |
| 🛡️ **Virus Scanning** | Automatic **VirusTotal** malware scanning before your app goes live. |
| 📜 **Version History** | Track every upload with full version history per app. |

### 🛂 For Admins

| Feature | Description |
|---|---|
| ✅ **Moderation Queue** | Review, approve, or reject submitted apps with email notifications to developers. |
| 🔬 **VT Scan Reports** | Full VirusTotal scan breakdown — malicious/suspicious/harmless/undetected/timeout — with color-coded progress bars. |
| 📝 **Review Moderation** | Respond to user reviews, delete inappropriate content, filter by rating or keyword. |
| 📈 **Download Analytics** | Total, unique, today, and weekly download counts. 30-day bar chart. Top 10 most-downloaded apps. |
| 👥 **User Management** | View all registered users and manage roles. |
| 🗂️ **Category Management** | Create and organize app categories. |
| 📣 **Announcements** | Post platform-wide announcements visible to all users. |
| 💌 **Feedback Inbox** | Review and respond to user-submitted feedback. |

### 🧩 Platform Features

- 🔐 **Role-Based Access** — Three tiers (user / developer / admin) with middleware-enforced route and API protection.
- 📧 **Email via Resend** — Beautiful branded HTML emails for confirmation, password reset, app publish/rejection, and review notifications. **Supabase's built-in emailer is fully replaced.**
- 🤖 **Telegram Alerts** — Real-time admin notifications for new users, new apps, malware detections, and errors.
- 🚦 **Rate Limiting** — 30 requests/min per IP on all API routes.
- 🛡️ **Security Headers** — Content Security Policy via Next.js, Supabase Row-Level Security on all tables.
- 🖼️ **Dynamic OG Images** — Auto-generated Open Graph images per app for social sharing.
- 📱 **Responsive Design** — Mobile-first layout built with Tailwind CSS. Works on phones, tablets, and desktops.
- ♿ **Accessibility** — Semantic HTML, ARIA labels, keyboard navigation support.
- 📄 **Legal Pages** — Privacy policy, terms of service, developer policy.

---

## 🏗️ Tech Stack

<div align="center">

| Layer | Technology | Badge |
|---|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) | ![Next.js](https://img.shields.io/badge/-000000?logo=nextdotjs) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (strict) | ![TypeScript](https://img.shields.io/badge/-3178C6?logo=typescript) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) | ![Supabase](https://img.shields.io/badge/-3ECF8E?logo=supabase) |
| **Auth** | [Supabase Auth](https://supabase.com/auth) (SSR sessions) | ![Supabase](https://img.shields.io/badge/-3ECF8E?logo=supabase) |
| **Storage** | [Cloudflare R2](https://www.cloudflare.com/r2/) | ![Cloudflare](https://img.shields.io/badge/-F38020?logo=cloudflare) |
| **Email** | [Resend](https://resend.com/) | ![Resend](https://img.shields.io/badge/-000000?logo=resend) |
| **Search** | BabaStore Feed API + Supabase | |
| **AI** | [NVIDIA NIM](https://build.nvidia.com/) / [Gemini](https://ai.google.dev/) | ![NVIDIA](https://img.shields.io/badge/-76B900?logo=nvidia) ![Gemini](https://img.shields.io/badge/-8E75B2?logo=googlegemini) |
| **Scanning** | [VirusTotal](https://www.virustotal.com/) | |
| **UI** | [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) | ![Tailwind](https://img.shields.io/badge/-06B6D4?logo=tailwindcss) |
| **Icons** | [Lucide](https://lucide.dev/) | |
| **Charts** | [Recharts](https://recharts.org/) | |
| **Animations** | [Framer Motion](https://motion.dev/) | |
| **Forms** | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) | ![Vitest](https://img.shields.io/badge/-6E9F18?logo=vitest) |
| **Deployment** | [Vercel](https://vercel.com/) | ![Vercel](https://img.shields.io/badge/-000000?logo=vercel) |

</div>

---

## 🚀 Quick Start

### Prerequisites

- ✅ [Node.js](https://nodejs.org/) >= 18.18
- ✅ A [Supabase](https://supabase.com/) project (free tier works)
- ✅ A [Cloudflare](https://www.cloudflare.com/) account with R2 enabled
- ✅ A [Resend](https://resend.com/) API key for email
- ➕ [VirusTotal](https://www.virustotal.com/) API key (optional, for APK scanning)
- ➕ [NVIDIA](https://build.nvidia.com/) or [Gemini](https://ai.google.dev/) API key (optional, for AI descriptions)

### 1️⃣ Clone & install

```bash
git clone https://github.com/prince-m2hgamerz/BabaStore.git
cd BabaStore
npm install
```

### 2️⃣ Set up Supabase

1. Create a project at [supabase.com](https://supabase.com/).
2. Open the **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql) — this creates all tables, triggers, and RLS policies.
3. Go to **Authentication → Settings** and set **Site URL** to your production domain.
4. In **Authentication → Providers**, enable Email auth.
5. Copy **Project URL**, **anon key**, and **`service_role` key** from **Project Settings → API**.

### 3️⃣ Configure environment

```bash
cp .env.example .env
```

<details>
<summary><strong>📋 Click to see all environment variables</strong></summary>

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | Your deployed domain |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase `service_role` key |
| `RESEND_API_KEY` | ✅ Yes | Resend API key |
| `RESEND_FROM_EMAIL` | ✅ Yes | Sender address |
| `VIRUSTOTAL_API_KEY` | ❌ No | VirusTotal API key |
| `CLOUDFLARE_API_TOKEN` | ❌ No | Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | ❌ No | Cloudflare account ID |
| `CLOUDFLARE_R2_BUCKET` | ❌ No | R2 bucket name |
| `CLOUDFLARE_R2_PUBLIC_URL` | ❌ No | R2 public bucket URL |
| `NVIDIA_API_KEY` | ❌ No | NVIDIA NIM API key |
| `GEMINI_API_KEY` | ❌ No | Google Gemini API key |
| `VITE_TELEGRAM_BOT_TOKEN` | ❌ No | Telegram bot token |
| `VITE_TELEGRAM_ADMIN_CHAT_ID` | ❌ No | Telegram chat ID |

</details>

### 4️⃣ Set up Cloudflare R2

```bash
npm run r2:setup
```

This creates the R2 bucket and enables public access. Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in `.env`.

### 5️⃣ Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 Development

### Commands

```bash
npm run dev          # 🔥 Start dev server (HMR)
npm run build        # 📦 Production build
npm run start        # 🚀 Start production server
npm run lint         # 🧹 Run ESLint
npm run typecheck    # ✅ Run TypeScript type checker
npm run test         # 🧪 Run unit tests
npm run test:watch   # 👀 Run tests in watch mode
npm run check        # 📋 typecheck + lint + test
npm run r2:setup     # ☁️ Configure Cloudflare R2 bucket
```

### Project Structure

```
src/
├── app/                        # 📄 Next.js App Router pages
│   ├── admin/                  #   🛂 Admin dashboard
│   │   ├── announcements/      #     📣 Platform announcements
│   │   ├── apps/[id]/          #     📱 App detail + VT scan report
│   │   ├── categories/         #     🗂️ Category management
│   │   ├── downloads/          #     📊 Download analytics + 30-day chart
│   │   ├── feedback/           #     💌 User feedback inbox
│   │   ├── reports/            #     🚩 Flagged content reports
│   │   ├── reviews/            #     📝 Review moderation
│   │   └── users/              #     👥 User management
│   ├── apps/[slug]/            # 📱 App detail page (public)
│   ├── auth/                   # 🔐 Auth callback + email confirm
│   ├── dashboard/              # 👤 User dashboard + wishlist
│   │   ├── apps/               #     📱 User's installed/published apps
│   │   └── wishlist/           #     ⭐ Saved wishlist
│   ├── developer/              # 🛠️ Developer console
│   │   ├── apps/[id]/          #     📱 Manage single app
│   │   ├── settings/           #     ⚙️ Developer settings
│   │   └── upload/             #     📦 Upload APK
│   ├── login/                  # 🔑 Sign in
│   ├── register/               # 📝 Create account
│   ├── forgot-password/        # 🔄 Password reset request
│   ├── reset-password/         # 🔐 Set new password
│   ├── legal/                  # ⚖️ Legal pages (privacy, terms, developer policy)
│   ├── settings/               # ⚙️ User settings
│   └── page.tsx                # 🏠 Homepage (hero, top charts, editors choice)
├── components/
│   ├── admin/                  # Admin UI components
│   ├── auth/                   # Login / register / password forms
│   ├── brand/                  # Logo, branding
│   ├── catalog/                # App cards, grids, filters, search, category chips
│   ├── dashboard/              # User dashboard widgets
│   ├── developer/              # Developer upload & management UI
│   ├── layout/                 # TopNav, sidebar, footer
│   ├── marketing/              # Homepage sections
│   └── ui/                     # Primitive UI kit (button, input, card, badge, etc.)
└── lib/
    ├── admin/                  # Admin data access & queries
    ├── ai/                     # AI providers (NVIDIA NIM, Google Gemini)
    ├── auth/                   # Route guards, permission helpers
    ├── catalog/                # Catalog fetching, formatting, providers, caching
    │   └── providers/          #   BabaStore Feed API adapter
    ├── developer/              # Developer data access
    ├── env/                    # Zod-validated environment variables
    ├── notifications/          # Email (Resend) + Telegram bot
    ├── security/               # Rate limiter + VirusTotal API
    ├── storage/                # Cloudflare R2 S3 client
    ├── supabase/               # Supabase clients (server, browser, admin, middleware)
    ├── user/                   # User profile data access
    └── validators/             # Zod schemas for form validation
```

### 🏗️ Key Architecture Decisions

<details>
<summary><strong>Click to expand</strong></summary>

- **⚡ Server Actions for all mutations** — No API routes needed for CRUD. Each action validates input with Zod, returns `{ ok, message }` states, and never throws.
- **🔐 Supabase SSR for auth** — Middleware refreshes sessions on every request. Protected routes are checked both in middleware and page-level guards.
- **📧 All email via Resend** — Supabase's built-in emailer is completely disabled. User creation, confirmation links, and password resets use the Supabase Admin API, and all emails are sent through Resend with a branded HTML template.
- **🔗 Dual-source catalog** — The homepage and search merge results from the external BabaStore Feed API + local Supabase `apps` table. External apps are identified by an `id` containing `":"`.
- **🛡️ Async VirusTotal scanning** — APKs are uploaded to R2, then scanned asynchronously. Results are stored in `upload_scans` and displayed in the admin detail view with per-category progress bars.
- **💬 Best-effort notifications** — All email and Telegram calls are fire-and-forget with try/catch. Failures never impact the user-facing response.
- **🗺️ Middleware-managed routing** — Role access is enforced in middleware for dashboard, developer, admin, and settings routes. Auth pages redirect authenticated users to their role home.

</details>

---

## 🧪 Testing

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run check         # typecheck + lint + test
```

Tests use [Vitest](https://vitest.dev/) with [Testing Library](https://testing-library.com/) and [jsdom](https://github.com/jsdom/jsdom).

---

## ☁️ API

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/download/[slug]` | `GET` | Public | Download APK (logs + redirects to R2) |
| `/api/developer/apps` | `GET` | Developer | List developer's apps |
| `/api/developer/apps/[id]` | `GET` | Developer | Get app details |
| `/api/developer/apps/[id]/versions` | `GET` | Developer | List app versions |
| `/api/developer/uploads/presign` | `POST` | Developer | Get presigned R2 upload URL |
| `/api/developer/uploads/scan-and-upload` | `POST` | Developer | Upload APK + trigger VirusTotal scan |

All API routes authenticate via the Supabase session cookie. Role checks are enforced inside each handler.

---

## 🗄️ Database Schema

The full schema is in [`supabase/schema.sql`](supabase/schema.sql).

| Table | Purpose |
|---|---|
| `profiles` | Extended user profiles (auto-created on signup via trigger) |
| `categories` | App categories (Games, Productivity, Education, etc.) |
| `apps` | App listings with metadata, status, and VT scan summary |
| `app_versions` | Version history with APK file references |
| `app_screenshots` | Screenshot image URLs per app |
| `reviews` | User ratings, reviews, and staff responses |
| `downloads` | Download event log for analytics |
| `wishlist_items` | User wishlist entries |
| `upload_scans` | VirusTotal scan results per upload attempt |

🔒 **Row-Level Security** is enabled on all tables:
- **Public** — Read-only access to published apps and categories
- **Authenticated** — Insert reviews, manage wishlist, update own profile
- **Developer** — Manage own apps and versions
- **Admin** — Full CRUD across all tables

---

## 🌐 Deployment

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fprince-m2hgamerz%2FBabaStore)

1. Push this repo to GitHub.
2. Click the **Deploy** button above or go to [Vercel](https://vercel.com/new).
3. Import the `BabaStore` repository.
4. Add all environment variables from `.env`.
5. Deploy ✅

> ⚠️ Update `NEXT_PUBLIC_SITE_URL` to your Vercel domain, and update the **Supabase Auth Site URL** setting to match.

### Manual deployment

```bash
npm run build
npm run start
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing`)
3. 💻 Make your changes
4. ✅ Run `npm run check` to verify
5. 📝 Commit (`git commit -m 'Add amazing feature'`)
6. 🚀 Push (`git push origin feature/amazing`)
7. 🔁 Open a Pull Request

---

## 📸 Screenshots

<details>
<summary><strong>🖼️ Click to view screenshots</strong></summary>

_TODO: Add screenshots of the homepage, app detail, admin dashboard, developer console, etc._

</details>

---

## 💖 Support

If you find BabaStore useful, consider supporting development:

<p align="center">
  <a href="https://github.com/sponsors/prince-m2hgamerz">
    <img src="https://img.shields.io/badge/GitHub_Sponsors-%E2%9D%A4%EF%B8%8F-ff69b4?style=for-the-badge&logo=githubsponsors" alt="GitHub Sponsors"/>
  </a>
  &nbsp;
  <a href="https://www.buymeacoffee.com/prince_m2hgamerz">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black" alt="Buy Me A Coffee"/>
  </a>
  &nbsp;
  <a href="https://github.com/prince-m2hgamerz/BabaStore">
    <img src="https://img.shields.io/badge/Star_on_GitHub-171717?style=for-the-badge&logo=github" alt="Star on GitHub"/>
  </a>
</p>

---

## 📄 License

[MIT](LICENSE) © [Prince M2HGamerz](https://github.com/prince-m2hgamerz)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/prince-m2hgamerz">Prince M2HGamerz</a></sub>
  <br/>
  <sub>BabaStore — The open Android app marketplace</sub>
</div>
