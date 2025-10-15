export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500
    const message = err.message || 'Internal Server Error'

    if (process.env.NODE_ENV !== 'test') {
        console.error(`[${statusCode}] ${message}`)
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
}
