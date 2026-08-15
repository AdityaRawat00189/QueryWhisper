import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json("Success");
});

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;