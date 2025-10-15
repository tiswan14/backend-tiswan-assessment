import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * Seed RefreshTokens
 * @param {Object} users - Object { admin, manager, user } hasil seedUsers
 */
export async function seedRefreshTokens(users) {
    console.log('Seeding RefreshTokens...')
    try {
        const refreshToken1 = await prisma.refreshToken.create({
            data: {
                token: 'sampletoken-admin-123',
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // +1 hari
                user: {
                    connect: { id: 'cmgl3zcc70001pc58v4sc4y3s' },
                },
            },
        })

        const refreshToken2 = await prisma.refreshToken.create({
            data: {
                token: 'sampletoken-user-123',
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
                user: {
                    connect: { id: 'cmgl3zc7v0000pc58cq7z85xu' },
                },
            },
        })

        console.log('✅ RefreshTokens seeded successfully!')
        return { refreshToken1, refreshToken2 }
    } catch (error) {
        console.error('❌ Error seeding RefreshTokens:', error)
        throw error
    }
}
