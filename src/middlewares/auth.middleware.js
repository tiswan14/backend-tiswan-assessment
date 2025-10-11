import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) {
        return res.status(401).json({ message: 'Token is required.' })
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res
                .status(403)
                .json({ message: 'Invalid or expired token.' })
        }
        req.user = user
        next()
    })
}
