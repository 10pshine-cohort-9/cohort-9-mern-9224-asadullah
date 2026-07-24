const userModel = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



async function registerUser(req, res) {
    const { name, email, password } = req.body;

    try {

        if (!name || !email || !password) return res.status(400).json({ message: 'fill all field' })
        const user = await userModel.findOne({ email })

        if (user) return res.status(400).json({ message: "user already Registered" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)


        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword
        })


        const payload = { userId: newUser._id }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(201).json({
            message: "user Created",
            token: token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email

            }

        })

    } catch (error) {

        res.status(500).json({ message: "server Error" })
        console.log(error.message)
    }

}



async function loginUser(req, res) {

    let { email, password } = req.body

    try {
        if (!email || !password) return res.status(400).json({ message: "fill all field" })

        const user = await userModel.findOne({ email }).select('+password')

        if (!user) return res.status(401).json({ message: "Invalid credentials" })

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });


        const payload = { userId: user._id };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: "Login Successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: "internal server Error" })
        console.log(error.message)

    }

}



async function getCurrentUser(req, res) {

    try {
        const userId = req.user.userId

        let user = await userModel.findById(userId).select('name email')

        if (!user) return res.status(404).json({ message: "user not found" })

        return res.status(200).json({
            message: "current user",
            user: {
                name: user.name,
                email: user.email
            }

        })


    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "internal server error" })

    }
}

module.exports = { registerUser, loginUser, getCurrentUser };