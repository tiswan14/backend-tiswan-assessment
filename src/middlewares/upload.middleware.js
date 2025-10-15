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
                    `File type not allowed. Only allowed: ${allowedMimeTypes
                        .map((type) => {
                            // Convert MIME types to user-friendly format
                            const parts = type.split('/')
                            if (parts[0] === 'image') {
                                return parts[1] === 'jpeg' ? 'jpg' : parts[1]
                            } else if (parts[0] === 'application') {
                                switch (parts[1]) {
                                    case 'pdf':
                                        return 'pdf'
                                    case 'msword':
                                        return 'doc'
                                    case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
                                        return 'docx'
                                    default:
                                        return parts[1]
                                }
                            }
                            return parts[1]
                        })
                        .join(', ')}`
                ),
                false
            )
        }
        cb(null, true)
    },
})
