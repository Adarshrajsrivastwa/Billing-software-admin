import { Router } from "express";
import authRoutes from "./auth.routes.js";
import projectRoutes from "./project.routes.js";
import invoiceRoutes from "./invoice.routes.js";
import clientRoutes from "./client.routes.js";
import itemRoutes from "./item.routes.js";
import categoryRoutes from "./category.routes.js";
import quotationRoutes from "./quotation.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/clients", clientRoutes);
router.use("/items", itemRoutes);
router.use("/categories", categoryRoutes);
router.use("/quotations", quotationRoutes);
router.use("/users", userRoutes);

export default router;
