import express from "express";
import { login,logout,signup,updateProfile,checkAuth } from "../controllers/auth.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile); // "protectRoute" checks if user is logged in or not to update profile 

router.get("/check", protectRoute, checkAuth);

export default router;


