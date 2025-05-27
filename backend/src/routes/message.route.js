import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);// "protectRoute" shows that this route is protected and only loggedIn user can access it
router.get("/:id", protectRoute, getMessages);// userid that we will like to fetch our messages with(older messages with particular user)

router.post("/send/:id", protectRoute, sendMessage); // "id" is the id of user we want to send messages to

export default router;


