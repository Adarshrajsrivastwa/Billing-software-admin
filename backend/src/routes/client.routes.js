import { Router } from "express";
import {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} from "../controllers/client.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createClientValidator,
  updateClientValidator,
  clientIdValidator,
  listClientsValidator,
} from "../validators/client.validator.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(listClientsValidator, validate, getClients)
  .post(createClientValidator, validate, createClient);

router
  .route("/:id")
  .get(clientIdValidator, validate, getClient)
  .put(updateClientValidator, validate, updateClient)
  .delete(clientIdValidator, validate, deleteClient);

export default router;
