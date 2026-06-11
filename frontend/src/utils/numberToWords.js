const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const twoDigits = (n) => {
  if (n < 20) return ones[n];
  return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`.trim();
};

const threeDigits = (n) => {
  if (!n) return "";
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return `${hundred ? `${ones[hundred]} Hundred` : ""}${rest ? ` ${twoDigits(rest)}` : ""}`.trim();
};

export const numberToWords = (amount) => {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return "INR Zero Only";

  let n = num;
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundredPart = n;

  const parts = [];
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundredPart) parts.push(threeDigits(hundredPart));

  return `INR ${parts.join(" ")} Only`;
};

export const amountWithPaiseWords = (amount) => {
  const value = Number(amount) || 0;
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);

  if (!paise) return numberToWords(rupees);

  const rupeeWords = numberToWords(rupees).replace(" Only", "");
  const paiseWords = twoDigits(paise);
  return `${rupeeWords} and ${paiseWords} paise Only`;
};
