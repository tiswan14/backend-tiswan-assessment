import fs from 'fs'
import path from 'path'

const dir = './tests/unit/'

// rekursif: ambil semua file di folder & subfolder
function addJestImportToFiles(dirPath) {
    const files = fs.readdirSync(dirPath)

    for (const file of files) {
        const fullPath = path.join(dirPath, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            addJestImportToFiles(fullPath)
        } else if (file.endsWith('.test.js')) {
            let content = fs.readFileSync(fullPath, 'utf-8')

            // hanya tambahkan kalau belum ada import @jest/globals
            if (!content.includes('@jest/globals')) {
                content = `import { jest } from '@jest/globals'\n` + content
                fs.writeFileSync(fullPath, content)
                console.log(`✅ Added jest import to: ${fullPath}`)
            }
        }
    }
}

addJestImportToFiles(dir)
console.log('🎉 Done adding jest imports!')
