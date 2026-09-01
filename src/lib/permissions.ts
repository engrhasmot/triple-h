export const ROLES = {
  admin: "admin",
  editor: "editor",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageProjects: true,
    canManageBlog: true,
    canManageTeam: true,
    canManageTestimonials: true,
    canManageFaqs: true,
    canManageInquiries: true,
    canManageFiles: true,
    canManageMedia: true,
    canManagePayments: true,
    canViewAnalytics: true,
    canViewActivityLog: true,
    canBackup: true,
  },
  editor: {
    canManageUsers: false,
    canManageProjects: true,
    canManageBlog: true,
    canManageTeam: true,
    canManageTestimonials: true,
    canManageFaqs: true,
    canManageInquiries: false,
    canManageFiles: true,
    canManageMedia: true,
    canManagePayments: false,
    canViewAnalytics: true,
    canViewActivityLog: false,
    canBackup: false,
  },
} as const;

export type Permission = keyof typeof PERMISSIONS.admin;

export function hasPermission(role: string, permission: Permission): boolean {
  const perms = PERMISSIONS[role as keyof typeof PERMISSIONS];
  if (!perms) return false;
  return perms[permission] ?? false;
}
