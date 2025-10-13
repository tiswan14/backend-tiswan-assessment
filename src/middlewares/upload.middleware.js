import multer from 'multer'

const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const storage = multer.memoryStorage()

export const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    `Tipe file tidak diizinkan. Hanya boleh: ${allowedMimeTypes
                        .map((t) => t.split('/')[1])
                        .join(', ')}`
                ),
                false
            )
        }
        cb(null, true)
    },
})
