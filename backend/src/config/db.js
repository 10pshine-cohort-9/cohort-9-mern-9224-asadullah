const mongoose = require('mongoose')

async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")
        
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1)
         throw error;
    }

    
}


module.exports = connectToDb;