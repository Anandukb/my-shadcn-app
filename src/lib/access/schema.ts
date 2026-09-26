import { z } from "zod";
import { isValidPermission } from "./permissions";

const permissionList = z
  .array(z.string())
  .refine((list) => list.every(isValidPermission), "Unknown permission in list");

export const roleInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(40),
  description: z.string().trim().max(200).default(""),
  permissions: permissionList,
});
export type RoleInput = z.infer<typeof roleInputSchema>;

export const userCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  roleId: z.string().uuid(),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    roleId: z.string().uuid(),
    isActive: z.boolean(),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
  })
  .partial();
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
