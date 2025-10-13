import rateLimit from 'express-rate-limit'

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many requests. Try again later.' },
})

export default rateLimiter
