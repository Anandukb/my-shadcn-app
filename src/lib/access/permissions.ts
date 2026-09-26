// Single source of truth for what a role can be granted. Safe to import from
// both server and client code (no server-only dependencies).

export type PermissionAction = "view" | "create" | "edit" | "delete";

export interface ResourceDefinition {
  key: string;
  label: string;
  description: string;
  actions: PermissionAction[];
}

const CRUD: PermissionAction[] = ["view", "create", "edit", "delete"];

// One entry per admin page. Package category pages have their own permissions;
// "packages" is the All Packages page and also grants every category.
export const RESOURCES: ResourceDefinition[] = [
  { key: "packages", label: "All Packages", description: "Every package across all categories", actions: CRUD },
  { key: "holidays", label: "Holidays", description: "Holiday packages page", actions: CRUD },
  { key: "cruise", label: "Cruise", description: "Cruise packages page", actions: CRUD },
  { key: "medical", label: "Medical Tourism", description: "Medical tourism packages page", actions: CRUD },
  { key: "kerala", label: "Kerala Tourism", description: "Kerala packages page", actions: CRUD },
  { key: "fixed_departures", label: "Fixed Departures", description: "Fixed departure packages page", actions: CRUD },
  { key: "live_chat", label: "Live Chat", description: "Answer visitors in real time", actions: ["view", "edit"] },
  { key: "enquiries", label: "Enquiries", description: "Customer enquiry inbox", actions: ["view", "edit"] },
  { key: "bookings", label: "Bookings", description: "Bookings created from enquiries", actions: ["view", "create", "edit"] },
  { key: "testimonials", label: "Testimonials", description: "Homepage reviews", actions: CRUD },
  { key: "visa", label: "Global Visa", description: "Visa countries and requirements", actions: CRUD },
  { key: "blog", label: "Blog", description: "SEO blog posts", actions: CRUD },
  { key: "users", label: "Users", description: "Staff accounts and which role each one has", actions: CRUD },
  { key: "roles", label: "Roles", description: "Create roles and choose their permissions", actions: CRUD },
];

/** Package category (as stored in the database) -> the resource that grants it. */
export const PACKAGE_CATEGORY_RESOURCE: Record<string, string> = {
  holidays: "holidays",
  cruise: "cruise",
  medical: "medical",
  kerala: "kerala",
  "fixed-departure": "fixed_departures",
};

/** Permissions that allow `action` on a package of `category` (any one is enough). */
export function packagePermissionOptions(action: PermissionAction, category: string): Permission[] {
  const resource = PACKAGE_CATEGORY_RESOURCE[category];
  return resource ? [permissionKey("packages", action), permissionKey(resource, action)] : [permissionKey("packages", action)];
}

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  create: "Add",
  edit: "Edit",
  delete: "Delete",
};

export type Permission = string;

export const permissionKey = (resource: string, action: PermissionAction): Permission =>
  `${resource}:${action}`;

export const ALL_PERMISSIONS: Permission[] = RESOURCES.flatMap((r) =>
  r.actions.map((a) => permissionKey(r.key, a)),
);

const ALL_SET = new Set(ALL_PERMISSIONS);

export function isValidPermission(value: string): boolean {
  return ALL_SET.has(value);
}

/** Admin pages and the permissions that open each one (any one is enough). */
export const PATH_PERMISSIONS: Array<{ prefix: string; anyOf: Permission[] }> = [
  { prefix: "/admin/packages", anyOf: ["packages:view"] },
  { prefix: "/admin/holidays", anyOf: ["holidays:view", "packages:view"] },
  { prefix: "/admin/cruise", anyOf: ["cruise:view", "packages:view"] },
  { prefix: "/admin/medical", anyOf: ["medical:view", "packages:view"] },
  { prefix: "/admin/kerala", anyOf: ["kerala:view", "packages:view"] },
  { prefix: "/admin/fixed-departures", anyOf: ["fixed_departures:view", "packages:view"] },
  { prefix: "/admin/enquiries", anyOf: ["enquiries:view"] },
  { prefix: "/admin/bookings", anyOf: ["bookings:view"] },
  { prefix: "/admin/live-chat", anyOf: ["live_chat:view"] },
  { prefix: "/admin/testimonials", anyOf: ["testimonials:view"] },
  { prefix: "/admin/global-visa", anyOf: ["visa:view"] },
  { prefix: "/admin/blog", anyOf: ["blog:view"] },
  { prefix: "/admin/users", anyOf: ["users:view"] },
  { prefix: "/admin/roles", anyOf: ["roles:view"] },
];

export function permissionsForPath(pathname: string): Permission[] | null {
  return PATH_PERMISSIONS.find((p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`))?.anyOf ?? null;
}

export function hasPermission(
  granted: { isSuperAdmin: boolean; permissions: readonly string[] },
  permission: Permission,
): boolean {
  return granted.isSuperAdmin || granted.permissions.includes(permission);
}

/** True if the holder has at least one of the listed permissions. */
export function hasAnyPermission(
  granted: { isSuperAdmin: boolean; permissions: readonly string[] },
  permissions: readonly Permission[],
): boolean {
  return permissions.some((p) => hasPermission(granted, p));
}

export const SUPER_ADMIN_SLUG = "super_admin";
