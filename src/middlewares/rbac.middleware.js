export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthorized.' })
        }

        const userRole = req.user.role
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. You do not have the required role.',
            })
        }

        next()
    }
}
