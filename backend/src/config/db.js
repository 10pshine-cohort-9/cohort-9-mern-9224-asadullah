const mongoose = require('mongoose')

async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("conneted to MONGODB")
        
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1)
    }

    
}


module.exports = connectToDb;