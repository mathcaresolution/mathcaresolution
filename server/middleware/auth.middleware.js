import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' })
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET)
        req.user = verified
        next()
    }
    catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' })
    }

}


export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' })
        }
        next()
    }
}