import { roleHome, roles, type UserRole } from "@/lib/constants";

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && roles.includes(value as UserRole);
}

export function getRoleHome(role: unknown) {
  return roleHome[isUserRole(role) ? role : "user"];
}

export function canAccessPath(role: UserRole, path: string) {
  if (path.startsWith("/admin")) {
    return role === "admin";
  }

  if (path.startsWith("/developer")) {
    return role === "developer" || role === "admin";
  }

  if (path.startsWith("/dashboard") || path.startsWith("/settings")) {
    return true;
  }

  return true;
}
