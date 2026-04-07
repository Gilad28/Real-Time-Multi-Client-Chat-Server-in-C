import { ENV } from "../lib/env.js"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

// middle ware used specifically for updating profile information.
export const protectRoute = async (req, res, next) => {
    try {
        // checks to see if there is a token from the jwt cookie
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "No token provided, failed"});
        }

        // checks to see if the token from the jwt is currently valid
        const decodedToken = jwt.verify(token, ENV.JWT_SECRET)
        if (!decodedToken) {
            return res.status(401).json({ message: "token is invalid, failed"});
        }

        // checks to see if the user that matches the token is valid
        const user = await User.findById(decodedToken.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "user is invalid, failed"});
        }

        req.user = user;
        next()
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error);
        res.status(500).json({message: "Internal error in middleware" });
    }
};