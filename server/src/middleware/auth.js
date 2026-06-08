import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
    // token comes in header like: "Bearer eyJhbGci..."
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' })
    }

    // split "Bearer eyJhbGci..." → take the second part
    const token = authHeader.split(' ')[1]

    try {
        // verify decodes the token and checks the signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // attach userId to request so controllers can use it
        req.user = decoded

        next()
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}

export default authMiddleware