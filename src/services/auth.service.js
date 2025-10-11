// File: src/services/auth.service.js

import { createUser, findUserByEmail } from '../repositories/auth.repository.js'
import { hashPassword } from '../utils/hash.js'

export const authService = {
    registerUser: async ({ name, email, password, role }) => {
        const existingUser = await findUserByEmail(email)
        if (existingUser) {
            throw new Error('Email already in use')
        }

        const hashedPassword = await hashPassword(password)

        const newUser = await createUser({
            name,
            email,
            password: hashedPassword,
            role,
        })

        return newUser
    },
}
