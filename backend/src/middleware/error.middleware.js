const logger = require('../utils/logger')


const errorHandler =(error,req,res,next)=>{


    logger.error(error, "Unhandled exception")

    return res.status(500).json({
        message:"Internal Server Error"
    })
   

}


module.exports = errorHandler