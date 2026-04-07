import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"

export const signup = async (req, res) => {
    const {username, email, password} = req.body

    try {
        // check that all fields are entered
        if (!username || !email || !password) {
            // return error code 400 for bad request and send error message to user
            return res.status(400).json({message:"Please fill out all fields"});
        }

        // checks that the password is at minimum 10 characters
        if (password.length < 10) {
            // return error code 400 for bad request and send error message to user
            return res.status(400).json({message:"Passwords should be atleast 10 characters"});
        }

        // checks if email is an actual email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            // return error code 400 for bad request and send error message to user
            return res.status(400).json({message:"Invalid email entered"});
        }

        const user = await User.findOne({email})
        if (user) {
            // return error code 400 for bad request and send error message to user
            return res.status(400).json({message:"Email already exists please login instead"});
        }

        // this encrypts the user's password so it's not stored in the database as is
        const saltHash = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, saltHash);

        // creates a new user for mongoDB to store
        const newUser = new User({
            username,
            email,
            password: passwordHash
        });

        if (newUser) {
            const saveUser = await newUser.save();
            generateToken(newUser._id, res);

            res.status(201).json({
                _id:newUser._id,
                username:newUser.username,
                email:newUser.email,
                profilePic:newUser.profilePicture,
            });

            // TODO: send confirmation email
        }
        else {
            // return error code 400 for bad request and send error message to user
            return res.status(400).json({message:"Invalid new user"});
        }

    } catch (error) {
        console.log("Error in the singup controller: ", error);
        res.status(500).json({message: "Internal error "});
    }
};

export const login = async (req, res) => {
    res.send("login endpoint");
};

export const logout = async (req, res) => {
    res.send("logout endpoint");
};