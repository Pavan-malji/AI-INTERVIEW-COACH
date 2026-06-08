import User from '../models/User.js'
import jwt from 'jsonwebtoken'

// helper function — keeps token generation in one place
// if you need to change token logic later, change it here only
const generateToken = (userId) => {
    return jwt.sign(
        { userId },                    // payload — what gets stored in token
        process.env.JWT_SECRET,        // secret key — used to sign and verify
        { expiresIn: '7d' }           // token expires in 7 days
    )
}

// POST /api/auth/register
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        // validate input exists
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        // check if email already taken
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' })
        }

        // create user — pre-save hook hashes password automatically
        const user = await User.create({ name, email, password })

        // generate token
        const token = generateToken(user._id)

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (err) {
        next(err) // passes error to global error handler in index.js
    }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        // find user by email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        // use the comparePassword method we defined in User model
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const token = generateToken(user._id)

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (err) {
        next(err)
    }
}