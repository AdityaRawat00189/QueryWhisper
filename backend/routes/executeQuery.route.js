import express from "express";
import { executeQuery } from "../controllers/executeQuery.controller.js";

const router = express.Router();

router.post("/", executeQuery);

export default router;