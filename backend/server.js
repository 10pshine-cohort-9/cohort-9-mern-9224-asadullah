const app = require('./src/app')
const connectToDb = require('./src/config/db')




require("dotenv").config();

connectToDb()




app.listen(process.env.PORT,()=>{
    console.log(`app is listening on ${process.env.PORT}`)
})

