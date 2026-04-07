import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => {
    // checks that the JWT_SECRET variable is set 
    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
        throw new Error ("JWT_SECRET is not defined")
    }
    // creates token to identify and authenticate user
    const token = jwt.sign({userId}, JWT_SECRET,{
        expiresIn: "7d"
    })

    res.cookie("jwt", token, {
        // 7 days stored as miliseconds
        maxAge: 7*24*60*60*1000,
        // used to prevent XSS known as cross-site scripting
        httpOnly: true,
        // used to prevent CRSF breaches
        sameSite: "strict",
        // when the NODE_ENV variable is set too development the link is http, otherwise is https
        secure: process.env.NODE_ENV === "development" ? false : true
    });

    return token
};