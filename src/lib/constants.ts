export const siteConfig = {
  name: "BabaStore",
  shortName: "BabaStore",
  description: "A modern Android app store for users, developers, and admins.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
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
