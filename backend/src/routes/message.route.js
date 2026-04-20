import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createDM } from "../controllers/message.controller.js"
import { createGroupChat } from "../controllers/message.controller.js"
import { getConversations } from "../controllers/message.controller.js"
import { sendMessage } from "../controllers/message.controller.js"
import { getMessages } from "../controllers/message.controller.js"
import { renameConversation } from "../controllers/message.controller.js"

const router = express.Router();

// Gets a list of all chats the user is in
router.get("/conversations", protectRoute, getConversations);
// Gets or makes a DM via an email input
router.post("/directMessages", protectRoute, createDM);
// creates a new group chat
router.post("/groupMessages", protectRoute, createGroupChat);
// gets all messages for a conversationId
router.get("/:conversationId/messages", protectRoute, getMessages);
// creates and sends a message in a chat
router.post("/:conversationId/send", protectRoute, sendMessage);
// renames a conversation
router.patch("/:conversationId/rename", protectRoute, renameConversation);


export default router;