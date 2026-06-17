import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getItems, createItem, updateItem, deleteItem } from "../../services/items";
import { getCategories } from "../../services/categories";
import {
  PackageSearch,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  Eye,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Tag,
  IndianRupee,
  ToggleLeft,
} from "lucide-react";

const COLORS = {
  primary: "#0F172A",
  accent: "#6366F1",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  muted: "#64748B",
};

const UNITS = ["Sq.ft", "Running Feet", "Meter", "Piece", "Nos", "Lump Sum"];
// Dynamic categories fetched from server
const GST_OPTIONS = ["0", "5", "12", "18", "28"];
const PAGE_SIZE = 5;

const INITIAL_ITEMS = [
  {
    id: "ITM-00001",
    name: "Wooden Flooring",
    category: "Flooring",
    unit: "Sq.ft",
    rate: 120,
    gst: 18,
    status: "Active",
    description: "High quality engineered wooden flooring",
  },
  {
    id: "ITM-00002",
    name: "False Ceiling Board",
    category: "False Ceiling",
    unit: "Sq.ft",
    rate: 85,
    gst: 12,
    status: "Active",
    description: "Gypsum false ceiling boards",
  },
  {
    id: "ITM-00003",
    name: "Modular Kitchen",
    category: "Furniture",
    unit: "Lump Sum",
    rate: 150000,
    gst: 18,
    status: "Active",
    description: "Full modular kitchen with hardware",
  },
  {
    id: "ITM-00004",
    name: "Wall Paint (Premium)",
    category: "Painting",
    unit: "Sq.ft",
    rate: 22,
    gst: 5,
    status: "Inactive",
    description: "Premium emulsion wall paint",
  },
  {
    id: "ITM-00005",
    name: "LED Strip Light",
    category: "Electrical",
    unit: "Running Feet",
    rate: 45,
    gst: 18,
    status: "Active",
    description: "12V RGB LED strip lights",
  },
  {
    id: "ITM-00006",
    name: "Wallpaper Installation",
    category: "Wallpaper",
    unit: "Sq.ft",
    rate: 35,
    gst: 12,
    status: "Active",
    description: "Designer wallpaper with installation",
  },
  {
    id: "ITM-00007",
    name: "Wardrobe (3 Door)",
    category: "Furniture",
    unit: "Nos",
    rate: 32000,
    gst: 18,
    status: "Inactive",
    description: "Sliding 3 door wardrobe with mirror",
  },
  {
    id: "ITM-00008",
    name: "Bathroom Fittings",
    category: "Plumbing",
    unit: "Lump Sum",
    rate: 25000,
    gst: 18,
    status: "Active",
    description: "Complete CP fittings set",
  },
  {
    id: "ITM-00009",
    name: "Vitrified Tiles",
    category: "Flooring",
    unit: "Sq.ft",
    rate: 65,
    gst: 18,
    status: "Active",
    description: "800x800 glossy vitrified tiles",
  },
  {
    id: "ITM-00010",
    name: "Ceiling Fan",
    category: "Electrical",
    unit: "Nos",
    rate: 3500,
    gst: 18,
    status: "Active",
    description: "48 inch premium ceiling fan",
  },
  {
    id: "ITM-00011",
    name: "Texture Paint",
    category: "Painting",
    unit: "Sq.ft",
    rate: 40,
    gst: 5,
    status: "Active",
    description: "Decorative texture paint finish",
  },
  {
    id: "ITM-00012",
    name: "Kitchen Tiles",
    category: "Flooring",
    unit: "Sq.ft",
    rate: 55,
    gst: 18,
    status: "Inactive",
    description: "Anti-skid kitchen floor tiles",
  },
];

// Using backend API service for persistence

// ─── Styles ───────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: "10px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  background: COLORS.white,
};

const emptyForm = {
  name: "",
  category: "",
  description: "",
  status: "Active",
};

// ─── Toast ────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}`}</style>
      {toasts.map((t) => {
        const bg =
          t.type === "success"
            ? "#059669"
            : t.type === "error"
              ? "#EF4444"
              : "#F59E0B";
        const Icon =
          t.type === "success" ? CheckCircle : t.type === "error" ? X : Info;
        return (
          <div
            key={t.id}
            style={{
              background: bg,
              color: "#fff",
              padding: "12px 20px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: "slideIn 0.3s ease",
              minWidth: 260,
            }}
          >
            <Icon size={16} />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────
function ViewModal({ item, onClose }) {
  const rows = [
    ["Item ID", item.id],
    ["Item Name", item.name],
    ["Category", item.category],
    ["Status", item.status],
    ["Description", item.description || "—"],
  ];
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: COLORS.white,
          borderRadius: "16px",
          width: "500px",
          maxWidth: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#EEF2FF",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: COLORS.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tag size={18} color="#fff" />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "700",
                  color: COLORS.primary,
                }}
              >
                {item.name}
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: COLORS.muted }}>
                {item.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: COLORS.muted,
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {rows.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "11px 0",
                borderBottom: `1px solid ${COLORS.border}`,
                fontSize: "14px",
              }}
            >
              <span style={{ color: COLORS.muted, fontWeight: "500" }}>
                {label}
              </span>
              <span
                style={{
                  color:
                    label === "Status"
                      ? value === "Active"
                        ? "#16A34A"
                        : "#DC2626"
                      : COLORS.primary,
                  fontWeight: "600",
                  maxWidth: "60%",
                  textAlign: "right",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.white,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────
function DeleteModal({ item, onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: COLORS.white,
          borderRadius: "16px",
          padding: "32px",
          width: "420px",
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 size={20} color="#DC2626" />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                color: COLORS.primary,
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Delete Item
            </h3>
            <p style={{ margin: 0, color: COLORS.muted, fontSize: "13px" }}>
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p
          style={{
            color: COLORS.muted,
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          Are you sure you want to delete{" "}
          <strong style={{ color: COLORS.primary }}>{item.name}</strong>?
        </p>
        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.white,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: "#DC2626",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────
function ItemModal({ mode, item, categories = [], onClose, onSave }) {
  const [form, setForm] = useState(
    mode === "edit"
      ? { ...item, rate: String(item.rate), gst: String(item.gst) }
      : emptyForm,
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Item name is required";
    if (!form.category) e.category = "Category is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave(form);
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: COLORS.primary,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: COLORS.white,
          borderRadius: "16px",
          width: "640px",
          maxWidth: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: COLORS.white,
            zIndex: 1,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "700",
              color: COLORS.primary,
            }}
          >
            {mode === "edit" ? "Edit Item" : "Add New Item"}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: COLORS.muted,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Basic Info */}
          <div
            style={{
              background: COLORS.bg,
              borderRadius: "12px",
              padding: "20px",
              border: `1px solid ${COLORS.border}`,
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: "600",
                color: COLORS.primary,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Tag size={15} color={COLORS.accent} /> Basic Information
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label style={labelStyle}>Item Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  style={{
                    ...inputStyle,
                    borderColor: errors.name ? "#EF4444" : COLORS.border,
                  }}
                />
                {errors.name && (
                  <span style={{ color: "#EF4444", fontSize: "12px" }}>
                    {errors.name}
                  </span>
                )}
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    borderColor: errors.category ? "#EF4444" : COLORS.border,
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && (
                  <span style={{ color: "#EF4444", fontSize: "12px" }}>
                    {errors.category}
                  </span>
                )}
              </div>
            </div>
            <div style={{ marginTop: "14px" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter item description"
                rows="3"
                style={inputStyle}
              />
            </div>
          </div>



          {/* Status */}
          <div
            style={{
              background: COLORS.bg,
              borderRadius: "12px",
              padding: "20px",
              border: `1px solid ${COLORS.border}`,
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: "14px",
                fontWeight: "600",
                color: COLORS.primary,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ToggleLeft size={15} color={COLORS.accent} /> Status
            </h3>
            <div style={{ display: "flex", gap: "12px" }}>
              {["Active", "Inactive"].map((s) => (
                <label
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    border: `1px solid ${form.status === s ? COLORS.accent : COLORS.border}`,
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: form.status === s ? COLORS.accent : COLORS.muted,
                    background: form.status === s ? "#EEF2FF" : COLORS.white,
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background:
                        form.status === s
                          ? s === "Active"
                            ? "#22C55E"
                            : "#EF4444"
                          : COLORS.border,
                    }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.white,
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                background: COLORS.accent,
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {mode === "edit" ? "Update Item" : "Save Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────
function Pagination({ total, page, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const btnBase = {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    background: COLORS.white,
    color: COLORS.muted,
  };
  return (
    <div
      style={{
        padding: "16px 20px",
        borderTop: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      <span style={{ fontSize: "13px", color: COLORS.muted }}>
        Showing {Math.min((page - 1) * pageSize + 1, total)}–
        {Math.min(page * pageSize, total)} of {total} items
      </span>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          style={{
            ...btnBase,
            opacity: page === 1 ? 0.4 : 1,
            cursor: page === 1 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...btnBase,
              background: p === page ? COLORS.accent : COLORS.white,
              color: p === page ? "#fff" : COLORS.muted,
              borderColor: p === page ? COLORS.accent : COLORS.border,
              fontWeight: p === page ? "700" : "500",
            }}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === Math.ceil(total / pageSize)}
          style={{
            ...btnBase,
            opacity: page === Math.ceil(total / pageSize) ? 0.4 : 1,
            cursor:
              page === Math.ceil(total / pageSize) ? "not-allowed" : "pointer",
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function AllItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchCats = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data.filter((c) => c.status === "Active").map((c) => c.name));
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getItems({ search });
      setItems(data);
    } catch (err) {
      showToast(err.message || "Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    fetchItems();
    window.addEventListener("focus", fetchItems);
    return () => {
      window.removeEventListener("focus", fetchItems);
    };
  }, [fetchItems]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = items;

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = async (form) => {
    try {
      if (modal.type === "add") {
        await createItem(form);
        showToast("Item added successfully!", "success");
      } else {
        await updateItem(modal.item._id, form);
        showToast("Item updated successfully!", "success");
      }
      fetchItems();
      setModal(null);
    } catch (err) {
      showToast(err.message || "Failed to save item", "error");
    }
  };

  const handleDelete = async () => {
    try {
      const name = modal.item.name;
      await deleteItem(modal.item._id);
      showToast(`"${name}" deleted successfully.`, "error");
      fetchItems();
      setModal(null);
      
      const newTotal = items.length - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      if (page > maxPage) setPage(maxPage);
    } catch (err) {
      showToast(err.message || "Failed to delete item", "error");
    }
  };

  return (
    <DashboardLayout>
      <Toast toasts={toasts} />

      <div
        style={{ background: COLORS.bg, minHeight: "100vh", padding: "30px" }}
      >
        {/* Modals */}
        {(modal?.type === "add" || modal?.type === "edit") && (
          <ItemModal
            mode={modal.type}
            item={modal.item}
            categories={categories}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
        {modal?.type === "delete" && (
          <DeleteModal
            item={modal.item}
            onCancel={() => setModal(null)}
            onConfirm={handleDelete}
          />
        )}
        {modal?.type === "view" && (
          <ViewModal item={modal.item} onClose={() => setModal(null)} />
        )}

        {/* Header */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: "16px",
            padding: "20px 24px",
            border: `1px solid ${COLORS.border}`,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: COLORS.primary,
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              <PackageSearch size={28} color={COLORS.accent} />
              All Items
            </h1>
            <p
              style={{
                marginTop: "4px",
                color: COLORS.muted,
                fontSize: "14px",
              }}
            >
              Manage your item catalogue for projects and quotations.
            </p>
          </div>
          <button
            onClick={() => setModal({ type: "add" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              background: COLORS.accent,
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Table Card */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: "16px",
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
          }}
        >
          {/* Search Bar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "10px",
                padding: "9px 14px",
                width: "300px",
              }}
            >
              <Search size={15} color={COLORS.muted} />
              <input
                type="text"
                placeholder="Search by name, category, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "13px",
                  color: COLORS.primary,
                  width: "100%",
                }}
              />
            </div>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "13px",
                color: COLORS.muted,
              }}
            >
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  {[
                    "Item ID",
                    "Item Name",
                    "Category",
                    "Status",
                    "Actions",
                  ].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: COLORS.muted,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: `1px solid ${COLORS.border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "48px",
                        textAlign: "center",
                        color: COLORS.muted,
                        fontSize: "14px",
                      }}
                    >
                      Loading items...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "48px",
                        textAlign: "center",
                        color: COLORS.muted,
                        fontSize: "14px",
                      }}
                    >
                      No items found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{
                        background: idx % 2 === 0 ? COLORS.white : "#FAFBFC",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F1F5FF")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          idx % 2 === 0 ? COLORS.white : "#FAFBFC")
                      }
                    >
                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: `1px solid ${COLORS.border}`,
                          color: COLORS.accent,
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.id}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: `1px solid ${COLORS.border}`,
                          color: COLORS.primary,
                          fontWeight: "500",
                        }}
                      >
                        {item.name}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 10px",
                            background: "#EEF2FF",
                            color: COLORS.accent,
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background:
                              item.status === "Active" ? "#DCFCE7" : "#FEE2E2",
                            color:
                              item.status === "Active" ? "#16A34A" : "#DC2626",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background:
                                item.status === "Active"
                                  ? "#16A34A"
                                  : "#DC2626",
                            }}
                          />
                          {item.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                        >
                          {[
                            {
                              Icon: Eye,
                              color: "#3B82F6",
                              hover: "#EFF6FF",
                              title: "View",
                              onClick: () => setModal({ type: "view", item }),
                            },
                            {
                              Icon: Pencil,
                              color: "#22C55E",
                              hover: "#F0FDF4",
                              title: "Edit",
                              onClick: () => setModal({ type: "edit", item }),
                            },
                            {
                              Icon: Trash2,
                              color: "#EF4444",
                              hover: "#FEF2F2",
                              title: "Delete",
                              onClick: () => setModal({ type: "delete", item }),
                            },
                          ].map(({ Icon, color, hover, title, onClick }) => (
                            <button
                              key={title}
                              title={title}
                              onClick={onClick}
                              style={{
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                border: "none",
                                background: "transparent",
                                color,
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = hover)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <Icon size={15} />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            total={filtered.length}
            page={page}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
