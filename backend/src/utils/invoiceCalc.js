export const calculateInvoice = ({
  items = [],
  roundOff = true,
  gstType = "intra",
}) => {
  const lines = items.map((item, index) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.rate) || 0;
    const gross = qty * rate;
    const disc = (gross * (Number(item.discount) || 0)) / 100;
    const taxable = gross - disc;
    const gstRate = Number(item.gstRate ?? item.gst) || 18;
    const gstAmount = taxable * (gstRate / 100);

    return {
      slNo: index + 1,
      description: item.description || item.itemName || "—",
      hsn: item.hsn || "9954",
      quantity: qty,
      unit: item.unit || "nos",
      rate,
      discount: disc,
      amount: taxable,
      gstRate,
      gstAmount,
    };
  });

  const taxableTotal = lines.reduce((s, l) => s + l.amount, 0);
  const totalGst = lines.reduce((s, l) => s + l.gstAmount, 0);
  const cgst = gstType === "intra" ? totalGst / 2 : 0;
  const sgst = gstType === "intra" ? totalGst / 2 : 0;
  const igst = gstType === "inter" ? totalGst : 0;
  const rawGrand = taxableTotal + totalGst;
  const grandTotal = roundOff ? Math.round(rawGrand) : rawGrand;
  const roundOffAmt = grandTotal - rawGrand;
  const totalQty = lines.reduce((s, l) => s + l.quantity, 0);

  const taxMap = {};
  lines.forEach((line) => {
    const key = `${line.hsn}-${line.gstRate}`;
    if (!taxMap[key]) {
      taxMap[key] = {
        hsn: line.hsn,
        taxable: 0,
        gstRate: line.gstRate,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
      };
    }
    taxMap[key].taxable += line.amount;
    const half = line.gstAmount / 2;
    if (gstType === "intra") {
      taxMap[key].cgst += half;
      taxMap[key].sgst += half;
    } else {
      taxMap[key].igst += line.gstAmount;
    }
    taxMap[key].totalTax += line.gstAmount;
  });

  return {
    lines,
    taxableTotal,
    cgst,
    sgst,
    igst,
    totalGst,
    roundOffAmt,
    grandTotal,
    totalQty,
    taxRows: Object.values(taxMap),
  };
};
