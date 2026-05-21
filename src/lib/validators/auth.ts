import { z } from "zod";
import { roles } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const registerSchema = loginSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters.").max(32),
  role: z.enum(roles).default("user")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

