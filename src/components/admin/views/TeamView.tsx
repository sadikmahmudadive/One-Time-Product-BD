"use client";

import { useMemo, useState } from "react";
import { getRootAdminEmails } from "@/lib/admin";
import { provisionTeamUserLogin, resetPassword } from "@/lib/firebase/auth";
import {
  ALL_PERMISSION_KEYS,
  ALL_PERMISSIONS,
  DEFAULT_MANAGER_PERMISSIONS,
  normalizeMemberEmail,
  normalizeTeamMember,
  type PermissionKey,
  type TeamMember,
  type TeamRole,
} from "@/lib/roles";
import { EmptyState, Icon, PageHeader, Panel, SearchField, SkeletonRows, StatCard, Tone } from "../ui";
import styles from "../admin.module.css";

interface TeamViewProps {
  currentUserEmail?: string | null;
  members: TeamMember[];
  loading: boolean;
  needsRules?: boolean;
  onSave: (member: TeamMember) => Promise<void>;
  onDelete: (email: string) => Promise<void>;
  notify: (tone: "success" | "error", text: string) => void;
}

const PERM_LABELS = new Map<PermissionKey, string>(ALL_PERMISSIONS.map((p) => [p.key, p.label]));

export function TeamView({
  currentUserEmail,
  members,
  loading,
  needsRules,
  onSave,
  onDelete,
  notify,
}: TeamViewProps) {
  const rootAdmins = useMemo(() => getRootAdminEmails(), []);
  const currentLower = normalizeMemberEmail(currentUserEmail ?? "");

  const [search, setSearch] = useState("");
  const [editingEmail, setEditingEmail] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    role: TeamRole;
  } | null>(null);
  const [revealCreatedPassword, setRevealCreatedPassword] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [resettingEmail, setResettingEmail] = useState<string | null>(null);
  const [role, setRole] = useState<TeamRole>("store_manager");
  const [permissions, setPermissions] = useState<PermissionKey[]>(DEFAULT_MANAGER_PERMISSIONS);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const metrics = useMemo(() => {
    const dbAdmins = members.filter((m) => m.role === "admin" && !rootAdmins.includes(m.email));
    const managers = members.filter((m) => m.role === "store_manager");
    const activeManagers = managers.filter((m) => m.active);
    const activeAdmins = rootAdmins.length + dbAdmins.filter((m) => m.active).length;
    return {
      total: rootAdmins.length + members.filter((m) => !rootAdmins.includes(m.email)).length,
      admins: activeAdmins,
      managers: managers.length,
      active: activeAdmins + activeManagers.length,
    };
  }, [members, rootAdmins]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (rootAdmins.includes(m.email)) return false;
      if (!q) return true;
      return `${m.email} ${m.name ?? ""} ${m.role}`.toLowerCase().includes(q);
    });
  }, [members, rootAdmins, search]);

  function resetForm() {
    setEditingEmail(null);
    setEmail("");
    setName("");
    setPassword("");
    setShowPassword(false);
    setRole("store_manager");
    setPermissions([...DEFAULT_MANAGER_PERMISSIONS]);
    setActive(true);
  }

  function generateStrongPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    const generated = Array.from(arr, (n) => chars[n % chars.length]).join("");
    setPassword(generated);
    setShowPassword(true);
  }

  async function copyCreatedCredentials() {
    if (!createdCredentials) return;
    const text = `One Time Product BD Admin Login\nURL: ${window.location.origin}/admin/login\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCredentials(true);
      setTimeout(() => setCopiedCredentials(false), 2000);
    } catch {
      notify("error", "Couldn’t copy credentials — select and copy them manually.");
    }
  }

  async function handleSendReset(targetEmail: string) {
    try {
      setResettingEmail(targetEmail);
      await resetPassword(targetEmail);
      notify("success", `Password reset email sent to ${targetEmail}.`);
    } catch (err) {
      notify(
        "error",
        `Couldn’t send reset email: ${(err as Error)?.message || "Check Firebase Email/Password auth."}`
      );
    } finally {
      setResettingEmail((prev) => (prev === targetEmail ? null : prev));
    }
  }

  function startEdit(m: TeamMember) {
    setEditingEmail(m.email);
    setEmail(m.email);
    setName(m.name ?? "");
    setPassword("");
    setShowPassword(false);
    setRole(m.role);
    setPermissions(m.role === "admin" ? [...ALL_PERMISSION_KEYS] : [...m.permissions]);
    setActive(m.active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function togglePermission(key: PermissionKey) {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleRoleChange(nextRole: TeamRole) {
    setRole(nextRole);
    if (nextRole === "admin") {
      setPermissions([...ALL_PERMISSION_KEYS]);
    } else if (permissions.length === ALL_PERMISSION_KEYS.length && !editingEmail) {
      setPermissions([...DEFAULT_MANAGER_PERMISSIONS]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = normalizeMemberEmail(email);
    if (!cleanEmail || !cleanEmail.includes("@")) {
      notify("error", "Enter a valid team member email address.");
      return;
    }
    if (rootAdmins.includes(cleanEmail)) {
      notify("error", "Root admin accounts defined in environment configuration already have permanent full access.");
      return;
    }
    if (!editingEmail && cleanEmail === currentLower) {
      notify("error", "You cannot modify your own current role here.");
      return;
    }
    if (role === "store_manager" && active && permissions.length === 0) {
      notify("error", "Select at least one permission for an active Store Manager.");
      return;
    }
    if (!editingEmail && password.length > 0 && password.length < 6) {
      notify("error", "Password must be at least 6 characters.");
      return;
    }

    const member = normalizeTeamMember({
      email: cleanEmail,
      name,
      role,
      permissions: role === "admin" ? ALL_PERMISSION_KEYS : permissions,
      active,
      addedBy: currentLower || undefined,
      createdAt: members.find((m) => m.email === cleanEmail)?.createdAt,
    });

    try {
      setSaving(true);
      await onSave(member);
      if (!editingEmail && password.length >= 6) {
        try {
          const authOutcome = await provisionTeamUserLogin(cleanEmail, password, member.name);
          if (authOutcome === "created") {
            setCreatedCredentials({ email: cleanEmail, password, role });
            setRevealCreatedPassword(false);
            setCopiedCredentials(false);
            notify("success", `Login profile created & role assigned for ${cleanEmail}.`);
          } else {
            notify(
              "error",
              `Assigned ${role === "admin" ? "Admin" : "Store Manager"} role for ${cleanEmail}, but this email already has an existing Firebase account — their existing password remains active (send a reset email if needed).`
            );
          }
        } catch (authErr) {
          notify(
            "error",
            `Role saved for ${cleanEmail}, but login creation failed: ${(authErr as Error)?.message || "Try again."}`
          );
        }
      }
      resetForm();
    } catch (err) {
      notify("error", `Couldn’t save team role: ${(err as Error)?.message || "Check permissions."}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(m: TeamMember) {
    if (m.email === currentLower) {
      notify("error", "You cannot pause your own signed-in admin account.");
      return;
    }
    try {
      await onSave({ ...m, active: !m.active });
    } catch {
      notify("error", `Couldn’t update status for ${m.email}.`);
    }
  }

  async function handleDelete(m: TeamMember) {
    if (m.email === currentLower) {
      notify("error", "You cannot remove your own signed-in admin account.");
      return;
    }
    if (!confirm(`Remove ${m.email} from the Admin / Store Manager team? They will lose dashboard access immediately.`)) {
      return;
    }
    try {
      await onDelete(m.email);
      if (editingEmail === m.email) resetForm();
    } catch {
      notify("error", `Failed to remove ${m.email}.`);
    }
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Team & Roles"
        description="Assign Admin (full access) or Store Manager (custom granted permissions) roles for /admin."
      />

      {needsRules && (
        <div className={styles.permissionNotice} role="status">
          <div className={styles.permissionNoticeHead}>
            <div className={styles.permissionNoticeTitle}>
              <Icon name="alert" size={18} />
              <span>Publish Updated Firestore Rules for Team Roles</span>
            </div>
          </div>
          <div className={styles.permissionNoticeBody}>
            <p>
              To store and enforce <code>admin</code> &amp; <code>store_manager</code> permissions across Firestore
              collections, publish the updated <code>firestore.rules</code> (with <code>match /team_roles/{"{email}"}</code>)
              in Firebase Console.
            </p>
          </div>
          <div className={styles.permissionNoticeActions}>
            <a
              href="https://console.firebase.google.com/project/onetime-product/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btnSm} ${styles.btnPrimary}`}
            >
              Open Firebase Rules <Icon name="external" size={14} />
            </a>
          </div>
        </div>
      )}

      <div className={styles.statGrid}>
        <StatCard
          label="Team members"
          value={String(metrics.total)}
          icon="customers"
          hint={<span className={styles.deltaNone}>Admins + store managers</span>}
        />
        <StatCard
          label="Full Admins"
          value={String(metrics.admins)}
          icon="shield"
          hint={<span className={styles.deltaNone}>Unrestricted access</span>}
        />
        <StatCard
          label="Store Managers"
          value={String(metrics.managers)}
          icon="settings"
          hint={<span className={styles.deltaNone}>Scoped by assigned permissions</span>}
        />
        <StatCard
          label="Active accounts"
          value={String(metrics.active)}
          icon="check"
          hint={<span className={styles.deltaNone}>Currently approved to sign in</span>}
        />
      </div>

      {/* ---------- Newly Created Login Credentials Confirmation ---------- */}
      {createdCredentials && (
        <Panel
          title={`User profile ready · ${createdCredentials.email}`}
          description="Share these login credentials with your team member so they can sign in at /admin/login."
          actions={
            <button type="button" className={styles.btnSm} onClick={() => setCreatedCredentials(null)}>
              Dismiss
            </button>
          }
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "grid", gap: 6, fontSize: 13.5 }}>
              <div>
                <span style={{ color: "var(--ink-700)", fontWeight: 600 }}>Email: </span>
                <code style={{ fontWeight: 700 }}>{createdCredentials.email}</code>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: "var(--ink-700)", fontWeight: 600 }}>Password: </span>
                <code style={{ fontWeight: 700 }}>
                  {revealCreatedPassword ? createdCredentials.password : "•".repeat(createdCredentials.password.length)}
                </code>
                <button
                  type="button"
                  className={styles.btnSm}
                  onClick={() => setRevealCreatedPassword((v) => !v)}
                >
                  {revealCreatedPassword ? "Hide" : "Reveal"}
                </button>
              </div>
            </div>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => void copyCreatedCredentials()}>
              <Icon name={copiedCredentials ? "check" : "copy"} size={15} />
              {copiedCredentials ? "Copied credentials" : "Copy login credentials"}
            </button>
          </div>
        </Panel>
      )}

      {/* ---------- Assign / Edit Role Panel ---------- */}
      <form onSubmit={handleSubmit}>
        <Panel
          title={editingEmail ? `Edit Access · ${editingEmail}` : "Create User Profile & Assign Role"}
          description={
            editingEmail
              ? "Switch role, adjust permissions, or send a password reset email for this account."
              : "Set an email and password to create their Firebase login immediately, or leave password blank for Google / existing accounts."
          }
          actions={
            editingEmail ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={styles.btnSm}
                  disabled={resettingEmail === editingEmail}
                  onClick={() => void handleSendReset(editingEmail)}
                >
                  {resettingEmail === editingEmail ? "Sending…" : "Send password reset email"}
                </button>
                <button type="button" className={styles.btnSm} onClick={resetForm}>
                  Cancel edit
                </button>
              </div>
            ) : undefined
          }
        >
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 14 }}>
              <div>
                <label className="lbl" htmlFor="tm-email">
                  Team Member Email *
                </label>
                <input
                  id="tm-email"
                  className="field"
                  type="email"
                  required
                  disabled={Boolean(editingEmail)}
                  placeholder="manager@onetimeproductbd.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="lbl" htmlFor="tm-name">
                  Display Name / Title (optional)
                </label>
                <input
                  id="tm-name"
                  className="field"
                  type="text"
                  placeholder="e.g. Rahim — Warehouse Manager"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {!editingEmail && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <label className="lbl" htmlFor="tm-password" style={{ marginBottom: 0 }}>
                      Login Password (min 6 chars)
                    </label>
                    <button
                      type="button"
                      className={styles.btnSm}
                      onClick={generateStrongPassword}
                      style={{ minHeight: 24, padding: "2px 8px", fontSize: 11.5 }}
                    >
                      Generate
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      id="tm-password"
                      className="field"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Leave blank if using Google login"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <button
                      type="button"
                      className={styles.btnSm}
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ minHeight: 46, padding: "0 12px" }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role cards */}
            <div>
              <span className="lbl">Role</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: role === "admin" ? "2px solid var(--brand-900)" : "1px solid var(--a-line-strong)",
                    background: role === "admin" ? "#f1f7f3" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="tm-role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => handleRoleChange("admin")}
                    style={{ marginTop: 3, accentColor: "var(--brand-900)" }}
                  />
                  <div>
                    <div className={styles.cellStrong}>Admin (Full Access)</div>
                    <div className={styles.sub}>
                      Can access all dashboard tabs, modify settings, and assign or revoke team roles.
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: role === "store_manager" ? "2px solid var(--brand-900)" : "1px solid var(--a-line-strong)",
                    background: role === "store_manager" ? "#f1f7f3" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="tm-role"
                    value="store_manager"
                    checked={role === "store_manager"}
                    onChange={() => handleRoleChange("store_manager")}
                    style={{ marginTop: 3, accentColor: "var(--brand-900)" }}
                  />
                  <div>
                    <div className={styles.cellStrong}>Store Manager (Custom Permissions)</div>
                    <div className={styles.sub}>
                      Gets only the permissions selected below. Cannot manage team roles.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Granular Permissions Checkboxes (when Store Manager) */}
            {role === "store_manager" && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: "#f8faf8",
                  border: "1px solid var(--a-line)",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <span className={styles.cellStrong}>Granted Permissions ({permissions.length} / {ALL_PERMISSIONS.length})</span>
                    <div className={styles.sub}>Select which sections &amp; actions this Store Manager can access.</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className={styles.btnSm}
                      onClick={() => setPermissions([...DEFAULT_MANAGER_PERMISSIONS])}
                    >
                      Orders &amp; Stock preset
                    </button>
                    <button
                      type="button"
                      className={styles.btnSm}
                      onClick={() => setPermissions([...ALL_PERMISSION_KEYS])}
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      className={styles.btnSm}
                      onClick={() => setPermissions([])}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 10 }}>
                  {ALL_PERMISSIONS.map((perm) => {
                    const checked = permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: checked ? "1px solid var(--brand-700)" : "1px solid var(--a-line)",
                          background: checked ? "#ffffff" : "rgba(255,255,255,0.6)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(perm.key)}
                          style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--brand-900)" }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--ink-950)" }}>
                            {perm.label}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--ink-700)", lineHeight: 1.4 }}>
                            {perm.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  style={{ width: 17, height: 17, accentColor: "var(--brand-900)" }}
                />
                Account active (can sign in to dashboard)
              </label>

              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                <Icon name="check" size={16} />
                {saving
                  ? "Saving…"
                  : editingEmail
                    ? "Update Role & Permissions"
                    : password.length > 0
                      ? "Create Profile & Assign Role"
                      : "Assign Role"}
              </button>
            </div>
          </div>
        </Panel>
      </form>

      {/* ---------- Team Directory Table ---------- */}
      <Panel title="Team Directory" description="Root admins from server config plus Firestore-assigned Admins & Store Managers." flush>
        <div className={styles.toolbar}>
          <SearchField
            label="Search team members"
            placeholder="Search by email, name or role"
            value={search}
            onChange={setSearch}
          />
        </div>

        {loading && members.length === 0 && rootAdmins.length === 0 ? (
          <SkeletonRows />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col">Role</th>
                  <th scope="col">Permissions</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className={styles.visuallyHidden}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rootAdmins
                  .filter((e) => !search.trim() || e.includes(search.trim().toLowerCase()))
                  .map((rootEmail) => (
                    <tr key={`root-${rootEmail}`}>
                      <td>
                        <div className={styles.cellStrong}>{rootEmail}</div>
                        <div className={styles.sub}>Root environment allowlist</div>
                      </td>
                      <td>
                        <Tone tone="accent">Root Admin</Tone>
                      </td>
                      <td>
                        <span className={styles.sub}>All permissions + Team management</span>
                      </td>
                      <td>
                        <Tone tone="success">Active</Tone>
                      </td>
                      <td>
                        <span className={styles.sub}>Protected</span>
                      </td>
                    </tr>
                  ))}

                {filteredMembers.length === 0 ? (
                  rootAdmins.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState
                          icon="shield"
                          title="No assigned team members yet"
                          text="Add a Store Manager or additional Admin above."
                        />
                      </td>
                    </tr>
                  )
                ) : (
                  filteredMembers.map((m) => {
                    const isSelf = m.email === currentLower;
                    return (
                      <tr key={m.email}>
                        <td>
                          <div className={styles.cellStrong}>{m.name || m.email}</div>
                          {m.name && <div className={styles.sub}>{m.email}</div>}
                        </td>
                        <td>
                          {m.role === "admin" ? (
                            <Tone tone="success">Admin</Tone>
                          ) : (
                            <Tone tone="info">Store Manager</Tone>
                          )}
                        </td>
                        <td>
                          {m.role === "admin" ? (
                            <span className={styles.sub}>All permissions + Team</span>
                          ) : m.permissions.length === 0 ? (
                            <span className={styles.sub}>None assigned</span>
                          ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {m.permissions.slice(0, 4).map((pk) => (
                                <span
                                  key={pk}
                                  style={{
                                    padding: "2px 7px",
                                    borderRadius: 999,
                                    background: "#eef3ef",
                                    color: "var(--brand-900)",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  {PERM_LABELS.get(pk) ?? pk}
                                </span>
                              ))}
                              {m.permissions.length > 4 && (
                                <span className={styles.sub}>+{m.permissions.length - 4} more</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <Tone tone={m.active ? "success" : "neutral"}>{m.active ? "Active" : "Paused"}</Tone>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.btnSm}
                              onClick={() => void handleToggleActive(m)}
                              disabled={isSelf}
                            >
                              {m.active ? "Pause" : "Activate"}
                            </button>
                            <button
                              type="button"
                              className={styles.btnSm}
                              onClick={() => void handleSendReset(m.email)}
                              disabled={resettingEmail === m.email}
                              title="Send password reset link"
                            >
                              {resettingEmail === m.email ? "Sending…" : "Reset pass"}
                            </button>
                            <button type="button" className={styles.btnSm} onClick={() => startEdit(m)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`${styles.btnSm} ${styles.btnDanger}`}
                              onClick={() => void handleDelete(m)}
                              disabled={isSelf}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
