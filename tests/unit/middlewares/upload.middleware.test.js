import multer from 'multer'
import { upload } from '../../../src/middlewares/upload.middleware.js'

describe('📤 upload.middleware Unit Tests', () => {
    it('✅ should use memoryStorage', () => {
        const storage = upload.storage
        expect(storage).toBeDefined()
        expect(multer.memoryStorage().constructor.name).toBe(
            storage.constructor.name
        )
    })

    it('✅ should allow valid MIME types', (done) => {
        const req = {}
        const file = { mimetype: 'image/png' }

        upload.fileFilter(req, file, (err, accepted) => {
            expect(err).toBeNull()
            expect(accepted).toBe(true)
            done()
        })
    })

    it('🚫 should reject invalid MIME types with detailed message', (done) => {
        const req = {}
        const file = { mimetype: 'text/plain' }

        upload.fileFilter(req, file, (err, accepted) => {
            expect(err).toBeInstanceOf(Error)
            expect(err.message).toContain('File type not allowed')
            expect(err.message).toContain('jpg')
            expect(err.message).toContain('png')
            expect(err.message).toContain('pdf')
            expect(accepted).toBe(false)
            done()
        })
    })

    it('🚫 should enforce file size limit (5MB)', () => {
        const limits = upload.limits
        expect(limits.fileSize).toBe(5 * 1024 * 1024)
    })

    // ✅ Perbaikan test terakhir tanpa perlu ekspor allowedMimeTypes
    it('✅ should generate a readable error message for invalid files', (done) => {
        const req = {}
        const file = { mimetype: 'text/unknown' }

        upload.fileFilter(req, file, (err) => {
            expect(err).toBeInstanceOf(Error)
            // memastikan format pesan error mengandung daftar ekstensi umum
            expect(err.message).toMatch(/jpg|png|pdf|doc|docx/)
            done()
        })
    })
})
