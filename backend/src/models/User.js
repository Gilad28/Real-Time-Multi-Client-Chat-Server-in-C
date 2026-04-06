import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unqiue: true,
    },
    userName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlenth: 10,
    },
    profilePicture: {
        type: String,
        default: "",
    },
}, 
{timestamps: true } // used to keep logs like createdAt and updatedAt
);

const User = mongoose.model("User", userSchema)4

export default User;