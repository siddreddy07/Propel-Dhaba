import { Router } from "express";
import { triageController } from "../controller/triage.controller.js";

const router = Router();

router.post("/triage", triageController);

export default router;