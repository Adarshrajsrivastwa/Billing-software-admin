import { Router } from "express";
import {
  createProject,
  getProjects,
  getBillingProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
  listProjectsValidator,
} from "../validators/project.validator.js";

const router = Router();

router.use(protect);

router.get("/billing/active", getBillingProjects);

router
  .route("/")
  .get(listProjectsValidator, validate, getProjects)
  .post(createProjectValidator, validate, createProject);

router
  .route("/:id")
  .get(projectIdValidator, validate, getProject)
  .put(updateProjectValidator, validate, updateProject)
  .delete(projectIdValidator, validate, deleteProject);

export default router;
