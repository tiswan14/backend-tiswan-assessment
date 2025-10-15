import {
    findAllUsers,
    findUserById,
    deleteUserById,
} from '../repositories/user.repository.js'
import { NotFoundError, ForbiddenError } from '../errors/constum.error.js'

export async function getAllUsers() {
    return await findAllUsers()
}

export async function getUserByIdService(userId, requesterRole) {
    const user = await findUserById(userId)
    if (!user) throw new NotFoundError('User not found.')

    if (requesterRole === 'MANAGER' && user.role === 'ADMIN') {
        throw new ForbiddenError('Managers cannot view Admin details.')
    }

    return user
}

export async function deleteUser(userId) {
    const user = await findUserById(userId)
    if (!user) throw new NotFoundError('User not found.')

    return await deleteUserById(userId)
}
