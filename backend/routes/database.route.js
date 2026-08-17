import express from "express";
import {allDatabase, addDatabase } from "../controllers/database.controller.js";

const router = express.Router();

router.get("/health", (req, res) => {
   res.json("healthy"); 
})

router.get("/all", allDatabase);
router.post("/add", addDatabase);

export default router;