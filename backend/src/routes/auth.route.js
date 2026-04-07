import express from "express";
import { signup } from "../controllers/auth.controller.js"
import { login } from "../controllers/auth.controller.js"
import { logout } from "../controllers/auth.controller.js"
import { updateProfile } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// pathways for the localhost website api stored at src/controllers/auth.controller.js
// These use .post instead of .get to avoid accidental caching or accidental sending on refresh
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
// this is an update so it uses .put instead of .post. can onluy be called while authenticated with a jwt cookie
router.put("/updateprofile", protectRoute, updateProfile);
// route to make sure user is authenticated on refresh
router.get("/check", protectRoute, (req,res) => res.status(200).json(req.user));

export default router;