// This is the main file used to connect to the mongoDB database
import mongoose from "mongoose"

export const connectDB = async () => {
    //console.log("DEBUG: MONGO_URL is", process.env.MONGO_URL); // Add this!
    try {
        const { MONGO_URL } = process.env;
        if (!MONGO_URL) {
            throw new Error ("MONGO_URL is not defined")
        }
        const mongoConnection = await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB has established a connection: ", mongoConnection.connection.host);
    } catch (error) {
        console.error("MongoDB could not establish a connection");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        process.exit(1);
    }
}