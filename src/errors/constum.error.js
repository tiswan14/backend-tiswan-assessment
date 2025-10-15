export class BadRequestError extends Error {
    constructor(message) {
        super(message)
        this.name = 'BadRequestError'
        this.statusCode = 400
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message)
        this.name = 'NotFoundError'
        this.statusCode = 404
    }
}

export class ForbiddenError extends Error {
    constructor(message) {
        super(message)
        this.name = 'ForbiddenError'
        this.statusCode = 403
    }
}

export class ConflictError extends Error {
    constructor(message) {
        super(message)
        this.name = 'ConflictError'
        this.status = 409
    }
}
