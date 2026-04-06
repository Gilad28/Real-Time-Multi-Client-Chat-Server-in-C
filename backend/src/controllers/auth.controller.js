export const signup = async (req, res) => {
    res.send("Signup endpoint");
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

    } catch (error) {

    }
};

export const login = async (req, res) => {
    res.send("login endpoint");
};

export const logout = async (req, res) => {
    res.send("logout endpoint");
};