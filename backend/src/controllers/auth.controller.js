import "dotenv/config";
import { sendWeclomeEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";

/*
this controller is used when an account is trying to signup using the form below as raw json
{
    {
    "username":"         ",
    "email":"              ",
    "password":"       "
    }
}
*/
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
            const savedUser = await newUser.save();
            generateToken(newUser._id, res);

            res.status(201).json({
                _id:newUser._id,
                username:newUser.username,
                email:newUser.email,
                profilePic:newUser.profilePicture,
            });

            // sends welcome email
            try {
                await sendWeclomeEmail(savedUser.email, savedUser.username, process.env.CLIENT_URL);
            } catch (error) {
                console.error("Could not send welcome email: ", error);
            }
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

/*
this controller is used when an account is trying to login using the form below as raw json
{
    "email":"          ",
    "password":"       "
}
*/
export const login = async (req, res) => {
    const {email, password} = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are both required for login."})
    }

    try {
        const user = await User.findOne({email});

        if (!user) {
            // Don't say which part of the login was invalid
            return res.status(400).json({message: "Invalid Credentials Entered"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            // Don't say which part of the login was invalid
            return res.status(400).json({message: "Invalid Credentials Entered"});
        }

        // user is authenticated
        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePicture,
        });

    } catch (error) {
        console.error("Error in login controller: ", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

/*
This controller requires no input or "req" and simply removes the cookie from the user
*/
export const logout = async (req, res) => {
    // remove cookie jwt from user on log out
    const cookieOptions = {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
        path: "/", // used to match the path used when initially setting the cookie
    };
    res.clearCookie("jwt", cookieOptions);
    return res.status(200).json({ message: "Logged Out Successfully." });
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePicture } = req.body;
        if (!profilePicture) {
            return res.status(400).json({ message: "No profile picture provided."})
        }

        const userId = req.user._id;
        const response = await cloudinary.uploader.upload(profilePicture);
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            {profilePicture: response.secure_url}, 
            {new: true}
        ).select("-password"); // dont send the password, it's supposed to be SECRET

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Internal Error."})
    }
};