import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../../services/users";
import {
  Users,
  UserPlus,
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  AlertTriangle,
  Search,
  Crown,
  ShieldOff,
} from "lucide-react";

/* ─── Color Tokens ─────────────────────────────────── */
const C = {
  bg: "#f6f5ff",
  white: "#ffffff",
  purple: "#7c3aed",
  purpleLight: "#ede9fe",
  purpleMid: "#a78bfa",
  green: "#059669",
  greenLight: "#d1fae5",
  red: "#dc2626",
  redLight: "#fee2e2",
  amber: "#d97706",
  amberLight: "#fef3c7",
  text: "#1e1b4b",
  textMid: "#4c4980",
  textLight: "#9ca3af",
  border: "#e5e7eb",
  shadow: "0 4px 24px rgba(124,58,237,0.10)",
};

/* ─── Helper ─────────────────────────────────────── */
const ROLE_COLORS = {
  admin: { bg: C.purpleLight, text: C.purple, icon: Crown },
  user: { bg: "#f0f9ff", text: "#0369a1", icon: User },
};

const avatarColor = (name = "") => {
  const colors = [
    "#7c3aed", "#0284c7", "#059669", "#d97706", "#dc2626",
    "#7c3aed", "#db2777", "#0891b2",
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

const initials = (name = "") =>
  name.slice(0, 2).toUpperCase();

/* ─── Reusable Input ─────────────────────────────── */
const Input = ({ label, icon: Icon, type = "text", value, onChange, placeholder, required, suffix }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 5 }}>
      {label} {required && <span style={{ color: C.red }}>*</span>}
    </label>
    <div style={{ position: "relative" }}>
      {Icon && (
        <Icon
          size={15}
          style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.textLight }}
        />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: `10px ${suffix ? "38px" : "12px"} 10px ${Icon ? "34px" : "12px"}`,
          borderRadius: 10,
          border: `1.5px solid ${C.border}`,
          fontSize: 13,
          color: C.text,
          background: C.white,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = C.purple)}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
      />
      {suffix && (
        <span
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
          onClick={suffix.onClick}
        >
          {suffix.content}
        </span>
      )}
    </div>
  </div>
);

/* ─── User Form Modal ─────────────────────────────── */
const UserModal = ({ mode, user, onClose, onSave }) => {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    role: "admin",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isEdit && !form.password) { setError("Password is required"); return; }
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: C.white, borderRadius: 20, width: "100%", maxWidth: 460,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto",
        animation: "slideUp 0.25s ease",
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.purple} 0%, #6d28d9 100%)`,
          padding: "22px 24px", borderRadius: "20px 20px 0 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: 8 }}>
              {isEdit ? <Edit3 size={18} color="#fff" /> : <UserPlus size={18} color="#fff" />}
            </div>
            <div>
              <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>
                {isEdit ? "Edit Admin" : "Add New Admin"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: 0 }}>
                {isEdit ? "Update admin details" : "Create login credentials"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
            <X size={18} color="#fff" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {error && (
            <div style={{ background: C.redLight, border: `1px solid #fca5a5`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={15} color={C.red} />
              <span style={{ fontSize: 13, color: C.red }}>{error}</span>
            </div>
          )}

          <Input label="Username" icon={User} value={form.username} onChange={set("username")} placeholder="e.g. john_doe" required />
          <Input label="Email Address" icon={Mail} type="email" value={form.email} onChange={set("email")} placeholder="john@company.com" required />
          <Input label="Mobile (optional)" icon={Phone} value={form.mobile} onChange={set("mobile")} placeholder="9XXXXXXXXX" />

          {/* Role is hardcoded to Admin */}
          <div style={{ marginBottom: 14, display: "none" }}>
            <input type="hidden" value={form.role} />
          </div>

          <Input
            label={isEdit ? "New Password (leave blank to keep)" : "Password"}
            icon={Lock}
            type={showPwd ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            placeholder={isEdit ? "Leave blank to keep current" : "Min 8 chars, A-Z, 0-9"}
            required={!isEdit}
            suffix={{
              onClick: () => setShowPwd((v) => !v),
              content: showPwd ? <EyeOff size={15} color={C.textLight} /> : <Eye size={15} color={C.textLight} />,
            }}
          />

          {!isEdit && (
            <p style={{ fontSize: 11, color: C.textLight, marginTop: -10, marginBottom: 14 }}>
              ⚠️ Must have uppercase, lowercase, and a number
            </p>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${C.border}`,
              background: C.white, fontSize: 13, fontWeight: 600, color: C.textMid, cursor: "pointer",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: "11px", borderRadius: 10, border: "none",
              background: loading ? C.purpleMid : C.purple,
              fontSize: 13, fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Delete Confirm Modal ─────────────────────────── */
const DeleteModal = ({ user, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 360, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Trash2 size={26} color={C.red} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>Delete Admin?</h3>
        <p style={{ fontSize: 13, color: C.textLight, margin: "0 0 24px" }}>
          <b>@{user.username}</b> ko permanently delete karna chahte hain? Ye action undo nahi hogi.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, fontWeight: 600, color: C.textMid, cursor: "pointer" }}>
            Cancel
          </button>
          <button disabled={loading} onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}
            style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: C.red, fontSize: 13, fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── USER CARD ─────────────────────────────────── */
const UserCard = ({ u, currentUserId, onEdit, onDelete, onToggle }) => {
  const isSelf = u._id === currentUserId;
  const [toggling, setToggling] = useState(false);

  return (
    <div style={{
      background: C.white, borderRadius: 16, border: `1.5px solid ${C.border}`,
      padding: 20, display: "flex", alignItems: "center", gap: 16,
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s",
      opacity: u.isActive ? 1 : 0.65,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = C.shadow; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
    >
      {/* Avatar */}
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: avatarColor(u.username),
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 16, fontWeight: 700, color: "#fff",
        border: `3px solid ${u.isActive ? "rgba(124,58,237,0.15)" : C.border}`,
      }}>
        {initials(u.username)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            @{u.username}
          </span>
          {isSelf && (
            <span style={{ fontSize: 10, fontWeight: 700, background: C.purpleLight, color: C.purple, padding: "2px 8px", borderRadius: 20 }}>YOU</span>
          )}
          <span style={{ fontSize: 11, fontWeight: 600, background: u.isActive ? C.greenLight : C.redLight, color: u.isActive ? C.green : C.red, padding: "3px 10px", borderRadius: 20 }}>
            {u.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <Mail size={11} style={{ display: "inline", marginRight: 4 }} />{u.email}
        </p>
        {u.mobile && (
          <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textLight }}>
            <Phone size={11} style={{ display: "inline", marginRight: 4 }} />{u.mobile}
          </p>
        )}
        <p style={{ margin: "3px 0 0", fontSize: 11, color: C.textLight }}>
          Joined: {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
        <button onClick={() => onEdit(u)} title="Edit"
          style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.purpleLight; e.currentTarget.style.borderColor = C.purple; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border; }}>
          <Edit3 size={14} color={C.purple} />
        </button>
        {!isSelf && (
          <>
            <button onClick={async () => { setToggling(true); await onToggle(u._id); setToggling(false); }} title={u.isActive ? "Deactivate" : "Activate"}
              style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.white, cursor: toggling ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.amberLight; e.currentTarget.style.borderColor = C.amber; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border; }}>
              {u.isActive ? <ToggleRight size={14} color={C.green} /> : <ToggleLeft size={14} color={C.textLight} />}
            </button>
            <button onClick={() => onDelete(u)} title="Delete"
              style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.redLight; e.currentTarget.style.borderColor = C.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border; }}>
              <Trash2 size={14} color={C.red} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── MAIN PAGE ─────────────────────────────────── */
export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  // filterRole state removed

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (data) => {
    await createUser(data);
    showToast("Admin created successfully! 🎉");
    fetchUsers();
  };

  const handleUpdate = async (data) => {
    await updateUser(editTarget._id, data);
    showToast("Admin updated successfully ✅");
    fetchUsers();
  };

  const handleDelete = async () => {
    await deleteUser(deleteTarget._id);
    setDeleteTarget(null);
    showToast("Admin deleted", "error");
    fetchUsers();
  };

  const handleToggle = async (id) => {
    await toggleUserStatus(id);
    showToast("Status updated");
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  // ── Admin-only guard ──
  if (currentUser && currentUser.role !== "admin") {
    return (
      <DashboardLayout>
        <div style={{ padding: "80px 32px", background: C.bg, minHeight: "100vh", fontFamily: "'Inter', 'Outfit', sans-serif", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <ShieldOff size={36} color={C.red} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 8px" }}>Access Denied</h2>
          <p style={{ fontSize: 14, color: C.textLight, maxWidth: 400, margin: "0 auto" }}>
            Sirf Admin accounts hi Admin Management access kar sakte hain. Agar aapko access chahiye toh existing admin se contact karein.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: "28px 32px", background: C.bg, minHeight: "100vh", fontFamily: "'Inter', 'Outfit', sans-serif" }}>

        {/* ── Toast ── */}
        {toast && (
          <div style={{
            position: "fixed", top: 20, right: 24, zIndex: 9999,
            background: toast.type === "error" ? C.red : C.green,
            color: "#fff", padding: "12px 20px", borderRadius: 12,
            fontSize: 13, fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            display: "flex", alignItems: "center", gap: 8,
            animation: "slideIn 0.3s ease",
          }}>
            {toast.type === "error" ? <AlertTriangle size={15} /> : <Check size={15} />}
            {toast.msg}
          </div>
        )}

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>Admin Management</h1>
            <p style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>
              Naye login admins banayein aur unhe manage karein
            </p>
          </div>
          <button onClick={() => setCreateModal(true)} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: `linear-gradient(135deg, ${C.purple} 0%, #6d28d9 100%)`,
            color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(124,58,237,0.35)", transition: "transform 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
            <UserPlus size={17} /> Add New Admin
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Admins", value: stats.total, icon: Shield, color: C.purple, bg: C.purpleLight },
            { label: "Active", value: stats.active, icon: ToggleRight, color: C.green, bg: C.greenLight },
            { label: "Inactive", value: stats.inactive, icon: ToggleLeft, color: C.red, bg: C.redLight },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: C.white, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>{value}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.textLight, fontWeight: 500 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div style={{ background: C.white, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = C.purple)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>
        </div>

        {/* ── User List ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.textLight }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${C.purpleLight}`, borderTopColor: C.purple, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
             <p>Loading admins…</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.red }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontWeight: 600 }}>{error}</p>
            <button onClick={fetchUsers} style={{ marginTop: 12, padding: "10px 24px", borderRadius: 10, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.textLight }}>
            <Users size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>Koi admin nahi mila</p>
            <p style={{ fontSize: 13 }}>Search change karein</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 14 }}>
            {filtered.map((u) => (
              <UserCard
                key={u._id}
                u={u}
                currentUserId={currentUser?._id}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {createModal && (
        <UserModal mode="create" onClose={() => setCreateModal(false)} onSave={handleCreate} />
      )}
      {editTarget && (
        <UserModal mode="edit" user={editTarget} onClose={() => setEditTarget(null)} onSave={handleUpdate} />
      )}
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </DashboardLayout>
  );
}
