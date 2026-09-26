export interface Role {
  id: string;
  slug: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
}

export interface StaffUser {
  id: string;
  email: string;
  fullName: string | null;
  roleId: string | null;
  roleName: string | null;
  roleSlug: string | null;
  isActive: boolean;
  lastSignInAt: string | null;
  createdAt: string;
}

export interface AdminMe {
  id: string;
  email: string | null;
  fullName: string | null;
  roleName: string | null;
  isSuperAdmin: boolean;
  permissions: string[];
}
