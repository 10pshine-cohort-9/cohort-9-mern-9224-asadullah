const mongoose = require('mongoose')

async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")
        
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
         throw error;
    }

    
}


module.exports = connectToDb;