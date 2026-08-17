import express from "express";
import { signup, login, logout, getMe } from "../controllers/auth.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json("Success");
});

router.get("/me", requireAuth, getMe);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;