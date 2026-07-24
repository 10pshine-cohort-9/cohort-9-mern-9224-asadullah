const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: 'token invalid' })

    try {

        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()


    } catch (error) {
        console.log(error.message)

        return res.status(401).json({ message: 'invalid Token' })
        

    }




}

module.exports = authMiddleware

