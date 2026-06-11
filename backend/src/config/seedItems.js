import { Item } from "../models/Item.js";
import { User } from "../models/User.js";

const DEFAULT_ITEMS = [
  {
    itemCode: "ITM-00001",
    name: "Wooden Flooring",
    category: "Flooring",
    unit: "Sq.ft",
    rate: 120,
    gst: 18,
    status: "Active",
    description: "High quality engineered wooden flooring",
  },
  {
    itemCode: "ITM-00002",
    name: "False Ceiling Board",
    category: "False Ceiling",
    unit: "Sq.ft",
    rate: 85,
    gst: 12,
    status: "Active",
    description: "Gypsum false ceiling boards",
  },
  {
    itemCode: "ITM-00003",
    name: "Modular Kitchen",
    category: "Furniture",
    unit: "Lump Sum",
    rate: 150000,
    gst: 18,
    status: "Active",
    description: "Full modular kitchen with hardware",
  },
  {
    itemCode: "ITM-00004",
    name: "Wall Paint (Premium)",
    category: "Painting",
    unit: "Sq.ft",
    rate: 22,
    gst: 5,
    status: "Inactive",
    description: "Premium emulsion wall paint",
  },
  {
    itemCode: "ITM-00005",
    name: "LED Strip Light",
    category: "Electrical",
    unit: "Running Feet",
    rate: 45,
    gst: 18,
    status: "Active",
    description: "12V RGB LED strip lights",
  },
  {
    itemCode: "ITM-00006",
    name: "Wallpaper Installation",
    category: "Wallpaper",
    unit: "Sq.ft",
    rate: 35,
    gst: 12,
    status: "Active",
    description: "Designer wallpaper with installation",
  },
  {
    itemCode: "ITM-00007",
    name: "Wardrobe (3 Door)",
    category: "Furniture",
    unit: "Nos",
    rate: 32000,
    gst: 18,
    status: "Inactive",
    description: "Sliding 3 door wardrobe with mirror",
  },
  {
    itemCode: "ITM-00008",
    name: "Bathroom Fittings",
    category: "Plumbing",
    unit: "Lump Sum",
    rate: 25000,
    gst: 18,
    status: "Active",
    description: "Complete CP fittings set",
  },
  {
    itemCode: "ITM-00009",
    name: "Vitrified Tiles",
    category: "Flooring",
    unit: "Sq.ft",
    rate: 65,
    gst: 18,
    status: "Active",
    description: "800x800 glossy vitrified tiles",
  },
  {
    itemCode: "ITM-00010",
    name: "Ceiling Fan",
    category: "Electrical",
    unit: "Nos",
    rate: 3500,
    gst: 18,
    status: "Active",
    description: "48 inch premium ceiling fan",
  },
  {
    itemCode: "ITM-00011",
    name: "Texture Paint",
    category: "Painting",
    unit: "Sq.ft",
    rate: 40,
    gst: 5,
    status: "Active",
    description: "Decorative texture paint finish",
  },
  {
    itemCode: "ITM-00012",
    name: "Kitchen Tiles",
    category: "Flooring",
    unit: "Sq.ft",
    rate: 55,
    gst: 18,
    status: "Inactive",
    description: "Anti-skid kitchen floor tiles",
  },
];

export const seedItems = async () => {
  const count = await Item.countDocuments();
  if (count > 0) return;

  const admin = await User.findOne({ email: "admin@gmail.com" });
  if (!admin) {
    console.log("Could not find default admin to attribute seeded items.");
    return;
  }

  const itemsToCreate = DEFAULT_ITEMS.map((item) => ({
    ...item,
    createdBy: admin._id,
  }));

  await Item.insertMany(itemsToCreate);
  console.log(`Successfully seeded ${itemsToCreate.length} default items.`);
};
