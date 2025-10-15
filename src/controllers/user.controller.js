import {
    getAllUsers,
    getUserByIdService,
    deleteUser,
} from '../services/user.service.js'

export async function getAllUsersController(req, res, next) {
    try {
        const users = await getAllUsers()
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            count: users.length,
            data: users,
        })
    } catch (error) {
        next(error)
    }
}

export async function getUserByIdController(req, res, next) {
    try {
        const { id } = req.params
        const user = await getUserByIdService(id)
        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
        })
    } catch (error) {
        next(error)
    }
}

export async function deleteUserController(req, res, next) {
    try {
        const { id } = req.params
        const deleted = await deleteUser(id)
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: deleted,
        })
    } catch (error) {
        next(error)
    }
}
