import { Plus, Trash2 } from "lucide-react";

export const FINANCIAL_TYPES = ["Payment", "Expense", "Advance", "Other"];

export const emptyFinancialDetail = () => ({
  title: "",
  amount: "",
  type: "Payment",
  date: "",
  note: "",
});

export const sanitizeFinancialDetails = (items = []) =>
  items
    .filter((item) => item.title?.trim() && Number(item.amount) > 0)
    .map((item) => ({
      title: item.title.trim(),
      amount: Number(item.amount),
      type: item.type || "Payment",
      date: item.date || undefined,
      note: item.note?.trim() || undefined,
    }));

export default function FinancialDetailsFields({
  financialDetails,
  onChange,
  inputStyle,
  accentColor = "#6366F1",
}) {
  const updateItem = (index, field, value) => {
    const updated = financialDetails.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  const addItem = () => {
    onChange([...financialDetails, emptyFinancialDetail()]);
  };

  const removeItem = (index) => {
    onChange(financialDetails.filter((_, i) => i !== index));
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#334155" }}>
          Additional Financial Details
        </p>
        <button
          type="button"
          onClick={addItem}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${accentColor}`,
            background: "#EEF2FF",
            color: accentColor,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={14} />
          Add Detail
        </button>
      </div>

      {financialDetails.length === 0 ? (
        <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
          No extra financial entries yet. Click &quot;Add Detail&quot; to add
          payments, expenses, etc.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {financialDetails.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: 14,
                background: "#FAFBFF",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder="e.g. Material Cost"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Amount (₹) *</label>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(index, "amount", e.target.value)}
                    placeholder="50000"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(index, "type", e.target.value)}
                    style={inputStyle}
                  >
                    {FINANCIAL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => updateItem(index, "date", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={labelStyle}>Note</label>
                <input
                  value={item.note}
                  onChange={(e) => updateItem(index, "note", e.target.value)}
                  placeholder="Optional note"
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  border: "none",
                  background: "#FEF2F2",
                  color: "#EF4444",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Trash2 size={13} />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "#64748B",
  marginBottom: 5,
  fontWeight: 500,
};
