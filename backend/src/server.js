import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { seedDefaultAdmin } from "./config/seedAdmin.js";
import { seedInvoiceSettings } from "./config/seedInvoiceSettings.js";
import { Item } from "./models/Item.js";
import { Category } from "./models/Category.js";

const startServer = async () => {
  await connectDB();
  await seedDefaultAdmin();
  await seedInvoiceSettings();

  // Clear default pre-seeded items and categories so only user created ones are shown
  await Item.deleteMany({
    itemCode: {
      $in: [
        "ITM-00001",
        "ITM-00002",
        "ITM-00003",
        "ITM-00004",
        "ITM-00005",
        "ITM-00006",
        "ITM-00007",
        "ITM-00008",
        "ITM-00009",
        "ITM-00010",
        "ITM-00011",
        "ITM-00012"
      ]
    }
  });

  await Category.deleteMany({
    name: {
      $in: [
        "Furniture",
        "Flooring",
        "False Ceiling",
        "Electrical",
        "Plumbing",
        "Painting",
        "Wallpaper",
        "Other"
      ]
    }
  });

  app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    console.log(`Health check: http://localhost:${env.port}/api/v1/health`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});
