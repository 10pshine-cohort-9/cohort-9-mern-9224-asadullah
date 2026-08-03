const logger = require('../utils/logger')


const errorHandler =(error,req,res,next)=>{


    logger.error(error, "Unhandled exception")

       if (res.headersSent) {
        return next(error)
    }


    return res.status(500).json({
        message:"Internal Server Error"
    })
   

}


module.exports = errorHandler