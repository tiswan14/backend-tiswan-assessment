import { createUser, findUserByEmail } from '../services/user.service.js'
import { signupSchema } from '../validators/auth.validator.js'

export async function signup(req, res, next) {
    try {
        const { error, value } = signupSchema.validate(req.body, {
            abortEarly: false,
        })

        if (error) {
            const errors = {}
            error.details.forEach((detail) => {
                const key = detail.path[0]
                // Hapus tanda kutip di sekitar field
                const cleanMessage = detail.message.replace(/["]/g, '')
                errors[key] = cleanMessage
            })
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            })
        }

        const { name, email, password, role } = value

        const existingUser = await findUserByEmail(email)
        if (existingUser)
            return res.status(400).json({ message: 'Email already in use' })

        const user = await createUser({ name, email, password, role })
        res.status(201).json({
            message: 'User created',
            user: { id: user.id, email: user.email, role: user.role },
        })
    } catch (error) {
        next(error)
    }
}
