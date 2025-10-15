import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const tasks = await prisma.task.findMany()
    console.log(tasks)
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
