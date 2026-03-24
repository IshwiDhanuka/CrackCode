const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const DBConnection = async() =>{
     // Get MongoDB connection string from environment variables
    const MONGO_URL = process.env.MONGODB_URL;


    // Validate that MongoDB URI is provided
    if(!MONGO_URL)
    {
        console.error("Error: MONGODB_URL enivronment variable is not set");
        process.exit(1);
    }

    try{
  // Simplified connection for modern Mongoose/MongoDB Driver
await mongoose.connect(MONGO_URL); console.log("Database connected successfully");
    }
    catch(error){
        console.error("Error while connecting to database:", error.message);
        process.exit(1);
    }
};

// Export the connection function for use in other modules
module.exports = { DBConnection };