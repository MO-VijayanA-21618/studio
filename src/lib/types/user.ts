import { z } from 'zod';

export const RoleSchema = z.enum(['admin', 'manager', 'staff', 'viewer']);
export type Role = z.infer<typeof RoleSchema>;

export const PermissionSchema = z.object({
  loans: z.object({
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
  }),
  accounting: z.object({
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
  }),
  users: z.object({
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
  }),
});
export type Permission = z.infer<typeof PermissionSchema>;

export const UserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(2),
  role: RoleSchema,
  permissions: PermissionSchema,
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type UserData = z.infer<typeof UserSchema>;

export const defaultPermissions: Record<Role, Permission> = {
  admin: {
    loans: { create: true, read: true, update: true, delete: true },
    accounting: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true },
  },
  manager: {
    loans: { create: true, read: true, update: true, delete: false },
    accounting: { create: true, read: true, update: true, delete: false },
    users: { create: false, read: true, update: false, delete: false },
  },
  staff: {
    loans: { create: true, read: true, update: false, delete: false },
    accounting: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
  },
  viewer: {
    loans: { create: false, read: true, update: false, delete: false },
    accounting: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
  },
};
