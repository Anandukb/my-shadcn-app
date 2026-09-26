"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, AlertCircle, Plus, Pencil, Trash2, ShieldCheck, KeyRound,
  UserCheck, UserX, Wand2, Lock,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { ACTION_LABELS, RESOURCES, permissionKey, type PermissionAction } from "@/lib/access/permissions";
import type { Role, StaffUser } from "@/lib/access/types";
import { useAdminMe } from "@/components/admin/useAdminMe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ── API helpers ──────────────────────────────────────────────────────────
async function api<T>(url: string, method: string, body: unknown, fallback: string): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, fallback));
  return res.json() as Promise<T>;
}

const fetchUsers = async () => (await api<{ users: StaffUser[] }>("/api/admin/users", "GET", null, "Failed to load users")).users;
const fetchRoles = async () => (await api<{ roles: Role[] }>("/api/admin/roles", "GET", null, "Failed to load roles")).roles;

const labelCls = "text-[11px] font-bold text-adm-fg-2 uppercase tracking-wide mb-1.5 block";
const inputCls = "bg-adm-page border-adm-line text-adm-fg";
const iconBtn = "p-2 rounded-xl text-adm-subtle hover:text-adm-fg hover:bg-adm-raised/60 transition-all cursor-pointer disabled:opacity-50";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function initials(name: string | null, email: string): string {
  const source = (name?.trim() || email).split(/[\s@.]+/).filter(Boolean);
  return ((source[0]?.[0] ?? "?") + (source[1]?.[0] ?? "")).toUpperCase();
}

function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-adm-danger">
      <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
      <span>{message}</span>
    </div>
  );
}

// ── User dialog (create + edit) ──────────────────────────────────────────
function UserDialog({
  user, roles, isSelf, onClose, canAssignRole,
}: {
  user: StaffUser | null;
  roles: Role[];
  isSelf: boolean;
  onClose: () => void;
  canAssignRole: (role: Role) => boolean;
}) {
  const queryClient = useQueryClient();
  const isEdit = user !== null;
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(user?.roleId ?? roles.find((r) => r.slug === "viewer")?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? api<StaffUser>(`/api/admin/users/${user.id}`, "PATCH", {
            fullName,
            roleId,
            ...(password ? { password } : {}),
          }, "Failed to update user")
        : api<StaffUser>("/api/admin/users", "POST", { fullName, email, password, roleId }, "Failed to create user"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const selectedRole = roles.find((r) => r.id === roleId);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-adm-surface border-adm-line text-adm-fg rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription className="text-adm-muted">
            {isEdit
              ? "Change their name, role or reset their password."
              : "Create a staff account. Share the password with them securely; they can sign in right away."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full name</label>
              <Input required minLength={2} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <Input required type="email" value={email} disabled={isEdit} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>{isEdit ? "New password (optional)" : "Password"}</label>
            <div className="flex gap-2">
              <Input
                required={!isEdit}
                minLength={8}
                type="text"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current" : "At least 8 characters"}
                className={`${inputCls} font-mono`}
              />
              <Button type="button" variant="outline" onClick={() => setPassword(generatePassword())} className="gap-1.5 shrink-0 cursor-pointer border-adm-line text-adm-fg-2">
                <Wand2 className="h-4 w-4" /> Generate
              </Button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Role</label>
            <select
              required
              value={roleId}
              disabled={isSelf}
              onChange={(e) => setRoleId(e.target.value)}
              className={`h-9 w-full rounded-md border px-3 text-sm cursor-pointer disabled:opacity-60 ${inputCls}`}
            >
              <option value="" disabled>Select a role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id} disabled={!canAssignRole(r) && r.id !== user?.roleId}>
                  {r.name}
                </option>
              ))}
            </select>
            {isSelf ? (
              <p className="text-[11px] text-adm-subtle mt-1.5">You can&apos;t change your own role.</p>
            ) : selectedRole ? (
              <p className="text-[11px] text-adm-subtle mt-1.5">
                {selectedRole.description || "No description."}{" "}
                {selectedRole.slug === "super_admin" ? "Full access." : `${selectedRole.permissions.length} permissions.`}
              </p>
            ) : null}
          </div>

          <ErrorNote message={error} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !roleId} className="cursor-pointer">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Role dialog with permission matrix ───────────────────────────────────
function RoleDialog({
  role, onClose, canGrant,
}: {
  role: Role | null;
  onClose: () => void;
  canGrant: (permission: string) => boolean;
}) {
  const queryClient = useQueryClient();
  const isEdit = role !== null;
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissions ?? []));
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const body = { name, description, permissions: [...selected] };
      return isEdit
        ? api<Role>(`/api/admin/roles/${role.id}`, "PATCH", body, "Failed to update role")
        : api<Role>("/api/admin/roles", "POST", body, "Failed to create role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-me"] });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const toggle = (permission: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(permission); else next.delete(permission);
      return next;
    });

  const toggleRow = (actions: PermissionAction[], resource: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const a of actions) {
        const key = permissionKey(resource, a);
        if (!canGrant(key) && !prev.has(key)) continue;
        if (on) next.add(key); else next.delete(key);
      }
      return next;
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-adm-surface border-adm-line text-adm-fg rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit role: ${role.name}` : "Create role"}</DialogTitle>
          <DialogDescription className="text-adm-muted">
            Pick exactly what people in this role can see and change.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Role name</label>
              <Input required minLength={2} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <Input maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this role for?" className={inputCls} />
            </div>
          </div>

          <div className="rounded-2xl border border-adm-line overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_repeat(4,4.5rem)_4rem] items-center gap-2 bg-adm-raised/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-adm-muted">
              <span>Area</span>
              {(Object.keys(ACTION_LABELS) as PermissionAction[]).map((a) => (
                <span key={a} className="text-center">{ACTION_LABELS[a]}</span>
              ))}
              <span className="text-center">All</span>
            </div>

            {RESOURCES.map((res) => {
              const keys = res.actions.map((a) => permissionKey(res.key, a));
              const allOn = keys.every((k) => selected.has(k));
              const editable = keys.some((k) => canGrant(k) || selected.has(k));
              return (
                <div key={res.key} className="grid grid-cols-2 sm:grid-cols-[1fr_repeat(4,4.5rem)_4rem] items-center gap-2 px-4 py-3 border-t border-adm-line">
                  <div className="col-span-2 sm:col-span-1 min-w-0">
                    <p className="text-sm font-bold text-adm-fg">{res.label}</p>
                    <p className="text-[11px] text-adm-subtle truncate">{res.description}</p>
                  </div>
                  {(Object.keys(ACTION_LABELS) as PermissionAction[]).map((a) => {
                    const supported = res.actions.includes(a);
                    const key = permissionKey(res.key, a);
                    const disabled = !canGrant(key) && !selected.has(key);
                    return (
                      <label key={a} className="flex sm:justify-center items-center gap-2 text-xs text-adm-fg-2">
                        {supported ? (
                          <input
                            type="checkbox"
                            checked={selected.has(key)}
                            disabled={disabled}
                            onChange={(e) => toggle(key, e.target.checked)}
                            className="h-4 w-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                          />
                        ) : (
                          <span className="hidden sm:block w-4 text-center text-adm-faint">–</span>
                        )}
                        {supported && <span className="sm:hidden">{ACTION_LABELS[a]}</span>}
                      </label>
                    );
                  })}
                  <label className="flex sm:justify-center items-center gap-2 text-xs text-adm-fg-2">
                    <input
                      type="checkbox"
                      checked={allOn}
                      disabled={!editable}
                      onChange={(e) => toggleRow(res.actions, res.key, e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    <span className="sm:hidden">All</span>
                  </label>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-adm-subtle -mt-2">
            You can only grant permissions you have yourself. Viewing an area&apos;s page needs its &ldquo;View&rdquo; permission.
          </p>

          <ErrorNote message={error} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save role" : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Confirm dialog ───────────────────────────────────────────────────────
function ConfirmDialog({
  title, body, confirmLabel, onConfirm, onClose, pending, error,
}: {
  title: string; body: React.ReactNode; confirmLabel: string;
  onConfirm: () => void; onClose: () => void; pending: boolean; error: string | null;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-adm-surface border-adm-line text-adm-fg rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-adm-muted">{body}</DialogDescription>
        </DialogHeader>
        <ErrorNote message={error} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
          <Button type="button" onClick={onConfirm} disabled={pending} className="cursor-pointer bg-red-600 hover:bg-red-500 text-white">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ───────────────────────────────────────────────────────
export default function UsersRolesManager({ view }: { view: "users" | "roles" }) {
  const queryClient = useQueryClient();
  const { me, can } = useAdminMe();
  const [userDialog, setUserDialog] = useState<{ user: StaffUser | null } | null>(null);
  const [roleDialog, setRoleDialog] = useState<{ role: Role | null } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: "user"; user: StaffUser } | { kind: "role"; role: Role } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers, enabled: view === "users" && can("users:view") });
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: fetchRoles, enabled: view === "users" ? can("users:view") : can("roles:view") });

  const users = usersQuery.data ?? [];
  const roles = rolesQuery.data ?? [];

  const canGrant = (permission: string) => !!me && (me.isSuperAdmin || me.permissions.includes(permission));
  const canAssignRole = (role: Role) =>
    role.slug === "super_admin" ? !!me?.isSuperAdmin : role.permissions.every(canGrant);

  const toggleActive = useMutation({
    mutationFn: (u: StaffUser) => api<StaffUser>(`/api/admin/users/${u.id}`, "PATCH", { isActive: !u.isActive }, "Failed to update user"),
    onSuccess: () => { setActionError(null); queryClient.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err) => setActionError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const deleteMutation = useMutation({
    mutationFn: (target: NonNullable<typeof deleting>) =>
      target.kind === "user"
        ? api(`/api/admin/users/${target.user.id}`, "DELETE", null, "Failed to delete user")
        : api(`/api/admin/roles/${target.role.id}`, "DELETE", null, "Failed to delete role"),
    onSuccess: () => {
      setDeleting(null);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const activeTab = view;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-adm-muted max-w-xl">
          {view === "users"
            ? <>Staff who can sign in to this panel. Each person gets one role, and the role decides which pages they can open and what they can do on them.{can("roles:view") && <> Manage roles on the <Link href="/admin/roles" className="font-semibold text-adm-accent hover:underline">Roles page</Link>.</>}</>
            : <>A role is a named set of permissions per page: view, add, edit or delete. Create a role here, then assign it to people on the <Link href="/admin/users" className="font-semibold text-adm-accent hover:underline">Users page</Link>.</>}
        </p>

        {activeTab === "users" && can("users:create") && (
          <Button onClick={() => setUserDialog({ user: null })} disabled={!rolesQuery.data} className="gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" /> Add user
          </Button>
        )}
        {activeTab === "roles" && can("roles:create") && (
          <Button onClick={() => setRoleDialog({ role: null })} className="gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" /> Create role
          </Button>
        )}
      </div>

      <ErrorNote message={actionError} />

      {/* ── Users ── */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-adm-line bg-adm-surface overflow-hidden">
          {usersQuery.isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-adm-subtle" /></div>
          ) : usersQuery.error ? (
            <div className="p-6"><ErrorNote message={(usersQuery.error as Error).message} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-adm-raised/60 text-left text-[11px] font-bold uppercase tracking-wide text-adm-muted">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 hidden md:table-cell">Last sign-in</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === me?.id;
                    const lockedSuper = u.roleSlug === "super_admin" && !me?.isSuperAdmin;
                    return (
                      <tr key={u.id} className={`border-t border-adm-line ${!u.isActive ? "opacity-60" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center">
                              {initials(u.fullName, u.email)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-adm-fg truncate">
                                {u.fullName || "—"} {isSelf && <span className="ml-1 text-[10px] font-semibold text-adm-accent">(you)</span>}
                              </p>
                              <p className="text-xs text-adm-subtle truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            u.roleSlug === "super_admin"
                              ? "border-violet-500/25 bg-violet-500/10 text-adm-violet"
                              : "border-blue-500/20 bg-blue-500/10 text-adm-accent"
                          }`}>
                            {u.roleSlug === "super_admin" && <ShieldCheck className="h-3 w-3" />}
                            {u.roleName ?? "No role"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.isActive ? "text-adm-ok" : "text-adm-subtle"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {u.isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-adm-muted hidden md:table-cell">{formatDate(u.lastSignInAt)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-0.5">
                            {can("users:edit") && !lockedSuper && (
                              <>
                                <button type="button" title="Edit" className={iconBtn} onClick={() => setUserDialog({ user: u })}>
                                  <Pencil className="h-4 w-4" />
                                </button>
                                {!isSelf && (
                                  <button
                                    type="button"
                                    title={u.isActive ? "Deactivate" : "Reactivate"}
                                    className={iconBtn}
                                    disabled={toggleActive.isPending}
                                    onClick={() => toggleActive.mutate(u)}
                                  >
                                    {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                  </button>
                                )}
                              </>
                            )}
                            {can("users:delete") && !isSelf && !lockedSuper && (
                              <button type="button" title="Delete" className={`${iconBtn} hover:!text-adm-danger`} onClick={() => { setActionError(null); setDeleting({ kind: "user", user: u }); }}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-14 text-center text-adm-muted">No staff accounts yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Roles ── */}
      {activeTab === "roles" && (
        rolesQuery.isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-adm-subtle" /></div>
        ) : rolesQuery.error ? (
          <ErrorNote message={(rolesQuery.error as Error).message} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {roles.map((r) => {
              const isSuper = r.slug === "super_admin";
              const areas = RESOURCES.filter((res) => res.actions.some((a) => r.permissions.includes(permissionKey(res.key, a))));
              return (
                <div key={r.id} className="rounded-2xl border border-adm-line bg-adm-surface p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {isSuper ? <Lock className="h-4 w-4 text-adm-violet" /> : <KeyRound className="h-4 w-4 text-adm-accent" />}
                        <h3 className="font-extrabold text-adm-fg truncate">{r.name}</h3>
                      </div>
                      <p className="text-xs text-adm-muted mt-1">{r.description || "No description."}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-adm-raised px-2.5 py-1 text-[11px] font-bold text-adm-muted">
                      {r.userCount} user{r.userCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 flex-1 content-start">
                    {isSuper ? (
                      <span className="rounded-md bg-violet-500/10 px-2 py-1 text-[11px] font-semibold text-adm-violet">Full access to everything</span>
                    ) : areas.length === 0 ? (
                      <span className="text-xs text-adm-subtle">No permissions</span>
                    ) : (
                      areas.map((res) => {
                        const acts = res.actions.filter((a) => r.permissions.includes(permissionKey(res.key, a)));
                        return (
                          <span key={res.key} className="rounded-md bg-adm-raised px-2 py-1 text-[11px] font-semibold text-adm-fg-2">
                            {res.label} <span className="text-adm-subtle font-medium">· {acts.map((a) => ACTION_LABELS[a].toLowerCase()).join(", ")}</span>
                          </span>
                        );
                      })
                    )}
                  </div>

                  {!isSuper && (can("roles:edit") || can("roles:delete")) && (
                    <div className="flex justify-end gap-1 border-t border-adm-line pt-3 -mb-1">
                      {can("roles:edit") && (
                        <Button variant="outline" size="sm" onClick={() => setRoleDialog({ role: r })} className="gap-1.5 cursor-pointer border-adm-line text-adm-fg-2">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                      )}
                      {can("roles:delete") && (
                        <Button variant="outline" size="sm" onClick={() => { setActionError(null); setDeleting({ kind: "role", role: r }); }} className="gap-1.5 cursor-pointer border-adm-line text-adm-danger hover:!text-adm-danger">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {userDialog && rolesQuery.data && (
        <UserDialog
          key={userDialog.user?.id ?? "new"}
          user={userDialog.user}
          roles={roles}
          isSelf={userDialog.user?.id === me?.id}
          canAssignRole={canAssignRole}
          onClose={() => setUserDialog(null)}
        />
      )}
      {roleDialog && (
        <RoleDialog key={roleDialog.role?.id ?? "new"} role={roleDialog.role} canGrant={canGrant} onClose={() => setRoleDialog(null)} />
      )}
      {deleting && (
        <ConfirmDialog
          title={deleting.kind === "user" ? "Delete this user?" : "Delete this role?"}
          body={
            deleting.kind === "user"
              ? <>This permanently removes <strong className="text-adm-fg">{deleting.user.fullName || deleting.user.email}</strong> and their sign-in. To keep the account but block access, deactivate it instead.</>
              : <>This permanently removes the <strong className="text-adm-fg">{deleting.role.name}</strong> role.</>
          }
          confirmLabel="Delete"
          pending={deleteMutation.isPending}
          error={actionError}
          onClose={() => { setDeleting(null); setActionError(null); }}
          onConfirm={() => deleteMutation.mutate(deleting)}
        />
      )}
    </div>
  );
}
