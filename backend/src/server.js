// this bypasses Windows DNS resolver for mongoose to establish a connection to mongoDB
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
// This is using the express package to run the backend
import express from "express";
// This is used to access the .env variables to avoid needing to hardcode them
import dotenv from "dotenv";
dotenv.config();
// used for running the backend and frontend at the same time with one command.
import path from "path";
// import the routes from the auth.route.js file
import authRoutes from "./routes/auth.route.js";
// import the routes from the message.route.js file
import messageRoutes from "./routes/message.route.js";
// import connectDB from the db.js file
import { connectDB } from "./lib/db.js"
// imports the cookie parser package
import cookieParser from "cookie-parser"

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT;

// Middleware
// This command allows input from the users in the req.body
app.use(express.json())
// Run the cookie parser package installed in the backend only
app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// Get ready for deployment when terminal command "npm run start" is used
if (process.env.NODE_ENV === "production" ){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend","dist","index.html"))
    });
}

app.listen(PORT, () => {
    console.log("Server is operational and running on port: " + PORT);
    connectDB();
});