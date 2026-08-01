const express = require('express')

const authRoutes = require('./routes/auth.routes')
const noteRoutes = require('./routes/note.routes')
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error.middleware')
const httpLogger = require('./middleware/httpLogger.middleware')

const app = express()



app.use(httpLogger)

app.use(express.json())

logger.info("application working")

app.use(express.urlencoded({extended:true}))

app.get('/',(req,res)=>{
     res.json({
    message: "Notes App",
  });
})



app.use('/api/auth', authRoutes);

app.use('/api/notes' , noteRoutes)

app.use(errorHandler)

module.exports =  app;