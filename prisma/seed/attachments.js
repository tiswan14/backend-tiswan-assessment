import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * Seed attachments
 * @param {Object} tasks - Object { task1, task2 } hasil seedTasks
 */
export async function seedAttachments(tasks) {
    console.log('Seeding Attachments...')
    try {
        const attachment1 = await prisma.attachment.create({
            data: {
                file_name: 'specs.pdf',
                file_url: 'https://example.com/specs.pdf',
                mime_type: 'application/pdf',
                task: {
                    connect: { id: 'cmgl452xd0001dp3025tercc1' },
                },
            },
        })

        const attachment2 = await prisma.attachment.create({
            data: {
                file_name: 'design.png',
                file_url: 'https://example.com/design.png',
                mime_type: 'image/png',
                task: {
                    connect: { id: 'cmgl4530c0003dp30cmd8ocyi' },
                },
            },
        })

        console.log('✅ Attachments seeded successfully!')
        return { attachment1, attachment2 }
    } catch (error) {
        console.error('❌ Error seeding Attachments:', error)
        throw error
    }
}
