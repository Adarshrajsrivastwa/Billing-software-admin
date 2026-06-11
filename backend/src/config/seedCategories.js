import { Category } from "../models/Category.js";
import { User } from "../models/User.js";

const DEFAULT_CATEGORIES = [
  { name: "Furniture", description: "All furniture and carpentry items" },
  { name: "Flooring", description: "Tiles, wood, vinyl and other flooring types" },
  { name: "False Ceiling", description: "Gypsum, grid, wooden ceilings and frames" },
  { name: "Electrical", description: "Wiring, switches, lights and fixtures" },
  { name: "Plumbing", description: "Pipes, faucets, basins and bathroom hardware" },
  { name: "Painting", description: "Putty, primer, emulsion and texture paints" },
  { name: "Wallpaper", description: "Wallpapers and mural sheets installation" },
  { name: "Other", description: "Miscellaneous interior work items" },
];

export const seedCategories = async () => {
  const count = await Category.countDocuments();
  if (count > 0) return;

  const admin = await User.findOne({ email: "admin@gmail.com" });
  if (!admin) {
    console.log("Could not find default admin to attribute seeded categories.");
    return;
  }

  const categoriesToCreate = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    status: "Active",
    createdBy: admin._id,
  }));

  await Category.insertMany(categoriesToCreate);
  console.log(`Successfully seeded ${categoriesToCreate.length} default categories.`);
};
