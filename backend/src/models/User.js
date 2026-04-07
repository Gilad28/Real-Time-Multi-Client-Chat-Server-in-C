import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 10,
    },
    profilePicture: {
        type: String,
        default: "",
    },
}, 
    {timestamps: true } // used to keep logs like createdAt and updatedAt
);

const User = mongoose.model("User", userSchema);

export default User;