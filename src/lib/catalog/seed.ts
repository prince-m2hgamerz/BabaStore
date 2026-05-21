import type { CatalogApp } from "@/lib/catalog/types";

export const seedApps: CatalogApp[] = [
  {
    id: "seed-nova-blocks",
    slug: "nova-blocks",
    name: "Nova Blocks",
    developer: "Arc Forge Labs",
    packageName: "com.arcforge.novablocks",
    version: "2.8.4",
    category: "Games",
    summary: "A lightweight voxel builder with creative worlds and offline play.",
    description:
      "Build compact voxel worlds, explore community seeds, and tune controls for mobile play. Nova Blocks is designed for fast launches and smooth offline sessions.",
    rating: 4.8,
    reviews: 18400,
    downloads: 1250000,
    sizeMb: 86,
    updatedAt: "2026-05-15",
    apkUrl: "https://example.com/apks/nova-blocks.apk",
    iconUrl: null,
    accent: "linear-gradient(135deg, #007cf0, #00dfd8)",
    tags: ["Voxel", "Offline", "Creative"],
    screenshots: [
      "linear-gradient(135deg, #007cf0, #00dfd8)",
      "linear-gradient(135deg, #171717, #4d4d4d)",
      "linear-gradient(135deg, #7928ca, #ff0080)"
    ],
    changelog: ["Improved world load speed", "Added compact HUD mode", "Fixed controller mapping"],
    status: "published"
  },
  {
    id: "seed-swift-notes",
    slug: "swift-notes",
    name: "Swift Notes",
    developer: "Paperplane Studio",
    packageName: "io.paperplane.swiftnotes",
    version: "5.2.1",
    category: "Productivity",
    summary: "Minimal notes, tasks, and pinned reminders with encrypted sync.",
    description:
      "Swift Notes keeps lists, memos, and lightweight project notes in one fast workspace. It ships with offline-first editing and optional encrypted sync.",
    rating: 4.6,
    reviews: 9200,
    downloads: 840000,
    sizeMb: 22,
    updatedAt: "2026-05-11",
    apkUrl: "https://example.com/apks/swift-notes.apk",
    iconUrl: null,
    accent: "linear-gradient(135deg, #7928ca, #ff0080)",
    tags: ["Notes", "Tasks", "Encrypted"],
    screenshots: [
      "linear-gradient(135deg, #fafafa, #d3e5ff)",
      "linear-gradient(135deg, #f5f5f5, #ebebeb)",
      "linear-gradient(135deg, #171717, #0070f3)"
    ],
    changelog: ["New pinned reminder lane", "Faster local search", "Export markdown folders"],
    status: "published"
  },
  {
    id: "seed-tutorflow",
    slug: "tutorflow",
    name: "TutorFlow",
    developer: "OpenClass Tools",
    packageName: "app.openclass.tutorflow",
    version: "1.9.0",
    category: "Education",
    summary: "Daily learning paths, quizzes, and offline lesson packs.",
    description:
      "TutorFlow turns lessons into short daily plans. Students can download packs, track streaks, and practice with adaptive quizzes.",
    rating: 4.7,
    reviews: 11800,
    downloads: 560000,
    sizeMb: 44,
    updatedAt: "2026-04-28",
    apkUrl: "https://example.com/apks/tutorflow.apk",
    iconUrl: null,
    accent: "linear-gradient(135deg, #50e3c2, #0070f3)",
    tags: ["Learning", "Quizzes", "Offline"],
    screenshots: [
      "linear-gradient(135deg, #50e3c2, #aaffec)",
      "linear-gradient(135deg, #0070f3, #d3e5ff)",
      "linear-gradient(135deg, #f9cb28, #ffefcf)"
    ],
    changelog: ["Offline packs now resume downloads", "New practice streak graph", "Teacher share links"],
    status: "published"
  },
  {
    id: "seed-secure-vault",
    slug: "secure-vault",
    name: "Secure Vault",
    developer: "Northstar Security",
    packageName: "security.northstar.vault",
    version: "4.4.3",
    category: "Tools",
    summary: "Private document vault with biometric unlock and local backups.",
    description:
      "Secure Vault stores sensitive files behind biometric unlock, encrypted folders, and optional local-only backup targets.",
    rating: 4.5,
    reviews: 6100,
    downloads: 430000,
    sizeMb: 19,
    updatedAt: "2026-03-22",
    apkUrl: "https://example.com/apks/secure-vault.apk",
    iconUrl: null,
    accent: "linear-gradient(135deg, #171717, #888888)",
    tags: ["Security", "Documents", "Biometric"],
    screenshots: [
      "linear-gradient(135deg, #171717, #4d4d4d)",
      "linear-gradient(135deg, #f5f5f5, #ffffff)",
      "linear-gradient(135deg, #0070f3, #0761d1)"
    ],
    changelog: ["Improved vault import", "Added backup integrity check", "Polished unlock screen"],
    status: "published"
  },
  {
    id: "seed-pulse-chat",
    slug: "pulse-chat",
    name: "Pulse Chat",
    developer: "Signal Yard",
    packageName: "chat.signalyard.pulse",
    version: "3.1.7",
    category: "Social",
    summary: "Fast group chat with channels, voice notes, and tiny data usage.",
    description:
      "Pulse Chat focuses on reliable low-bandwidth conversations with channels, reactions, and quick voice notes for teams and communities.",
    rating: 4.4,
    reviews: 7300,
    downloads: 670000,
    sizeMb: 37,
    updatedAt: "2026-05-02",
    apkUrl: "https://example.com/apks/pulse-chat.apk",
    iconUrl: null,
    accent: "linear-gradient(135deg, #ff0080, #ff4d4d)",
    tags: ["Chat", "Groups", "Voice"],
    screenshots: [
      "linear-gradient(135deg, #ff0080, #7928ca)",
      "linear-gradient(135deg, #ffffff, #f5f5f5)",
      "linear-gradient(135deg, #00dfd8, #007cf0)"
    ],
    changelog: ["Voice notes render faster", "Channel mute controls", "Improved message restore"],
    status: "published"
  },
  {
    id: "seed-framebox",
    slug: "framebox",
    name: "FrameBox",
    developer: "Metro Media",
    packageName: "media.metro.framebox",
    version: "6.0.2",
    category: "Entertainment",
    summary: "Offline video queue, watchlists, and compact media discovery.",
    description:
      "FrameBox helps users organize watchlists, cache trailers, and discover short-form media with a clean mobile-first interface.",
    rating: 4.3,
    reviews: 5400,
    downloads: 390000,
    sizeMb: 64,
    updatedAt: "2026-04-04",
    apkUrl: "https://example.com/apks/framebox.apk",
    iconUrl: null,
    accent: "linear-gradient(135deg, #ff4d4d, #f9cb28)",
    tags: ["Video", "Watchlist", "Offline"],
    screenshots: [
      "linear-gradient(135deg, #ff4d4d, #f9cb28)",
      "linear-gradient(135deg, #171717, #7928ca)",
      "linear-gradient(135deg, #fafafa, #ffefcf)"
    ],
    changelog: ["New offline queue controls", "Cleaner watchlist filters", "Reduced cache size"],
    status: "published"
  }
];

