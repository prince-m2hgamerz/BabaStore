export const siteConfig = {
  name: "BabaStore",
  shortName: "BabaStore",
  description:
    "Discover and install Android APKs on BabaStore — the open Android app marketplace. Browse thousands of free apps, games, tools, and VPNs. Publish your own Android apps with our developer console. Safe APK downloads, ratings, reviews, and wishlists.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  keywords: [
    "Android apps",
    "APK download",
    "free Android apps",
    "Android app store",
    "APK marketplace",
    "BabaStore",
    "Android games",
    "APK installer",
    "Android APK",
    "app store alternative",
    "Android app publishing",
    "APK hosting"
  ]
};

export const roles = ["user", "developer", "admin"] as const;

export type UserRole = (typeof roles)[number];

export const roleHome: Record<UserRole, string> = {
  user: "/dashboard",
  developer: "/developer",
  admin: "/admin"
};

export const categorySeeds = [
  "Games",
  "Productivity",
  "Education",
  "Social",
  "Entertainment",
  "Tools"
];
