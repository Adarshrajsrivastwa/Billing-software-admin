import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  PackagePlus,
  Tag,
  IndianRupee,
  ToggleLeft,
  CheckCircle,
  X,
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

import { createItem } from "../../services/items";
import { getCategories } from "../../services/categories";

// ─── Toast ────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === "success" ? "#059669" : "#EF4444",
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
          }}
        >
          {t.type === "success" ? <CheckCircle size={16} /> : <X size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function AddItem() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.filter((c) => c.status === "Active").map((c) => c.name));
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name])
      setErrors((prev) => ({ ...prev, [e.target.name]: false }));
  };

  const validate = () => {
    const e = {};
    if (!formData.itemName.trim()) e.itemName = true;
    if (!formData.category) e.category = true;
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      showToast("Please fill required fields", "error");
      return;
    }

    try {
      await createItem(formData);
      showToast("Item saved successfully!");
      setTimeout(() => navigate("/catalog/all"), 1500);
    } catch (err) {
      showToast(err.message || "Failed to save item", "error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const errBorder = (key) =>
    errors[key] ? { ...inputStyle, borderColor: "#EF4444" } : inputStyle;

  return (
    <DashboardLayout>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <Toast toasts={toasts} />

      <div
        style={{ background: COLORS.bg, minHeight: "100vh", padding: "30px" }}
      >
        {/* Header */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: "16px",
            padding: "20px",
            border: `1px solid ${COLORS.border}`,
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: COLORS.primary,
            }}
          >
            <PackagePlus size={28} color={COLORS.accent} />
            Add Item
          </h1>
          <p style={{ marginTop: "6px", color: COLORS.muted }}>
            Add and manage items for your projects and quotations.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div
            style={{
              background: COLORS.white,
              borderRadius: "16px",
              padding: "24px",
              border: `1px solid ${COLORS.border}`,
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
                color: COLORS.primary,
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              <Tag size={20} color={COLORS.accent} />
              Basic Information
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: COLORS.primary,
                  }}
                >
                  Item Name *
                </label>
                <input
                  type="text"
                  name="itemName"
                  placeholder="Enter item name"
                  value={formData.itemName}
                  style={errBorder("itemName")}
                  onChange={handleChange}
                />
                {errors.itemName && (
                  <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                    Item name is required
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: COLORS.primary,
                  }}
                >
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  style={errBorder("category")}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                    Category is required
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: COLORS.primary,
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter item description"
                rows="4"
                value={formData.description}
                style={inputStyle}
                onChange={handleChange}
              />
            </div>
          </div>



          {/* Status */}
          <div
            style={{
              background: COLORS.white,
              borderRadius: "16px",
              padding: "24px",
              border: `1px solid ${COLORS.border}`,
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
                color: COLORS.primary,
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              <ToggleLeft size={20} color={COLORS.accent} />
              Status
            </h2>
            <div style={{ display: "flex", gap: "16px" }}>
              {["Active", "Inactive"].map((s) => (
                <label
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    border: `1px solid ${formData.status === s ? COLORS.accent : COLORS.border}`,
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: formData.status === s ? COLORS.accent : COLORS.muted,
                    background:
                      formData.status === s ? "#EEF2FF" : COLORS.white,
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={formData.status === s}
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background:
                        formData.status === s
                          ? s === "Active"
                            ? "#22C55E"
                            : "#EF4444"
                          : COLORS.border,
                      display: "inline-block",
                    }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
          >
            <button
              type="button"
              onClick={() => navigate("/catalog/all")}
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
              type="submit"
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
              Save Item
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
