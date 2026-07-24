const express = require('express')

const authRoutes = require('./routes/auth.routes')

const app = express()


app.use(express.json())

app.use(express.urlencoded({extended:true}))

app.get('/',(req,res)=>{
     res.json({
    message: "Notes App",
  });
})



app.use('/api/auth', authRoutes);

module.exports =  app;