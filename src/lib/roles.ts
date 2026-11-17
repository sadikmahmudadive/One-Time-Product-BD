import type { Tab } from "@/components/admin/views/types";

export type TeamRole = "admin" | "store_manager";

export type PermissionKey =
  | "view_overview"
  | "manage_orders"
  | "manage_quotes"
  | "manage_coupons"
  | "manage_products"
  | "manage_inventory"
  | "manage_media"
  | "view_customers"
  | "manage_settings";

export interface PermissionMeta {
  key: PermissionKey;
  label: string;
  description: string;
  tab: Tab;
}

export const ALL_PERMISSIONS: PermissionMeta[] = [
  {
    key: "view_overview",
    label: "Overview & Analytics",
    description: "View sales totals, charts and quick operational highlights.",
    tab: "overview",
  },
  {
    key: "manage_orders",
    label: "Orders & Delivery Slips",
    description: "View orders, update fulfilment status and print invoices.",
    tab: "orders",
  },
  {
    key: "manage_quotes",
    label: "Quotes & Messages",
    description: "View and follow up on wholesale quote requests and contact enquiries.",
    tab: "quotes",
  },
  {
    key: "manage_coupons",
    label: "Coupons & Top Offer Bar",
    description: "Create discount codes and feature offers in the top storefront banner.",
    tab: "coupons",
  },
  {
    key: "manage_products",
    label: "Products & Catalogue",
    description: "Add, edit, delete catalogue items, pricing tiers and product photos.",
    tab: "products",
  },
  {
    key: "manage_inventory",
    label: "Inventory & Stock",
    description: "Update warehouse available units and low-stock alert levels.",
    tab: "inventory",
  },
  {
    key: "manage_media",
    label: "Media Uploads",
    description: "Upload product photography and copy Cloudinary asset links.",
    tab: "media",
  },
  {
    key: "view_customers",
    label: "Customers & Subscribers",
    description: "View customer order histories, newsletter emails and CSV exports.",
    tab: "customers",
  },
  {
    key: "manage_settings",
    label: "Store & Contact Settings",
    description: "Edit phone, WhatsApp, email, Instagram and showroom/factory address.",
    tab: "settings",
  },
];

export const ALL_PERMISSION_KEYS: PermissionKey[] = ALL_PERMISSIONS.map((p) => p.key);

export const DEFAULT_MANAGER_PERMISSIONS: PermissionKey[] = [
  "view_overview",
  "manage_orders",
  "manage_inventory",
  "manage_quotes",
];

export interface TeamMember {
  email: string;
  name?: string;
  role: TeamRole;
  permissions: PermissionKey[];
  active: boolean;
  addedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export function normalizeMemberEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePermissions(raw: unknown): PermissionKey[] {
  if (!Array.isArray(raw)) return [];
  const valid = new Set<string>(ALL_PERMISSION_KEYS);
  return Array.from(
    new Set(raw.filter((x): x is PermissionKey => typeof x === "string" && valid.has(x)))
  );
}

export function normalizeTeamMember(raw: Partial<TeamMember> & { email: string }): TeamMember {
  const role: TeamRole = raw.role === "admin" ? "admin" : "store_manager";
  return {
    email: normalizeMemberEmail(raw.email),
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : undefined,
    role,
    permissions: role === "admin" ? [...ALL_PERMISSION_KEYS] : normalizePermissions(raw.permissions),
    active: raw.active !== false,
    addedBy: typeof raw.addedBy === "string" && raw.addedBy.trim() ? raw.addedBy.trim() : undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export interface UserAccess {
  isTeamMember: boolean;
  isRootAdmin: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  role: TeamRole | null;
  permissions: PermissionKey[];
  hasPermission: (key: PermissionKey) => boolean;
  canAccessTab: (tab: Tab) => boolean;
  allowedTabs: Tab[];
}

export function resolveUserAccess(
  email: string | null | undefined,
  isRootEnvAdmin: boolean,
  teamRecord: TeamMember | null
): UserAccess {
  const cleanEmail = email?.trim().toLowerCase() ?? "";

  if (!cleanEmail) {
    return {
      isTeamMember: false,
      isRootAdmin: false,
      isSuperAdmin: false,
      isAdmin: false,
      role: null,
      permissions: [],
      hasPermission: () => false,
      canAccessTab: () => false,
      allowedTabs: [],
    };
  }

  if (isRootEnvAdmin) {
    return {
      isTeamMember: true,
      isRootAdmin: true,
      isSuperAdmin: true,
      isAdmin: true,
      role: "admin",
      permissions: [...ALL_PERMISSION_KEYS],
      hasPermission: () => true,
      canAccessTab: () => true,
      allowedTabs: [
        "overview",
        "orders",
        "quotes",
        "coupons",
        "products",
        "inventory",
        "media",
        "customers",
        "settings",
        "team",
      ],
    };
  }

  if (!teamRecord || !teamRecord.active || normalizeMemberEmail(teamRecord.email) !== cleanEmail) {
    return {
      isTeamMember: false,
      isRootAdmin: false,
      isSuperAdmin: false,
      isAdmin: false,
      role: null,
      permissions: [],
      hasPermission: () => false,
      canAccessTab: () => false,
      allowedTabs: [],
    };
  }

  if (teamRecord.role === "admin") {
    return {
      isTeamMember: true,
      isRootAdmin: false,
      isSuperAdmin: false,
      isAdmin: true,
      role: "admin",
      permissions: [...ALL_PERMISSION_KEYS],
      hasPermission: () => true,
      canAccessTab: () => true,
      allowedTabs: [
        "overview",
        "orders",
        "quotes",
        "coupons",
        "products",
        "inventory",
        "media",
        "customers",
        "settings",
        "team",
      ],
    };
  }

  const perms = normalizePermissions(teamRecord.permissions);
  const permSet = new Set<PermissionKey>(perms);
  const tabForPerm = new Map<Tab, PermissionKey>(ALL_PERMISSIONS.map((p) => [p.tab, p.key]));

  const canAccessTab = (tab: Tab): boolean => {
    if (tab === "team") return false;
    const req = tabForPerm.get(tab);
    return req ? permSet.has(req) : false;
  };

  const tabOrder: Tab[] = [
    "overview",
    "orders",
    "quotes",
    "coupons",
    "products",
    "inventory",
    "media",
    "customers",
    "settings",
  ];

  return {
    isTeamMember: true,
    isRootAdmin: false,
    isSuperAdmin: false,
    isAdmin: false,
    role: "store_manager",
    permissions: perms,
    hasPermission: (key) => permSet.has(key),
    canAccessTab,
    allowedTabs: tabOrder.filter(canAccessTab),
  };
}
