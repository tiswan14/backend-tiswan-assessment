import { jest } from '@jest/globals'
import {
    taskCreateSchema,
    taskUpdateSchema,
} from '../../../src/validators/task.validator.js'

describe('Task Validator Schemas', () => {
    // ---------------- taskCreateSchema ----------------
    describe('taskCreateSchema', () => {
        it('should validate a valid task payload', () => {
            const payload = {
                title: 'Finish API Documentation',
                description: 'Write full documentation for API endpoints',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                due_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
                assigned_to_id: 'user123',
            }

            const { error, value } = taskCreateSchema.validate(payload)
            expect(error).toBeUndefined()
            expect(value.title).toBe('Finish API Documentation')
        })

        it('should fail if title is too short', () => {
            const payload = {
                title: 'Hi',
                due_date: new Date(Date.now() + 86400000).toISOString(),
            }

            const { error } = taskCreateSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/title/)
        })

        it('should fail if due_date is missing', () => {
            const payload = {
                title: 'Task tanpa due date',
            }

            const { error } = taskCreateSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/due_date/)
        })

        it('should fail if due_date is in the past', () => {
            const payload = {
                title: 'Past Task',
                due_date: new Date(Date.now() - 86400000).toISOString(), // -1 day
            }

            const { error } = taskCreateSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/due_date/)
        })

        it('should fail if status is invalid', () => {
            const payload = {
                title: 'Invalid Status',
                due_date: new Date(Date.now() + 86400000).toISOString(),
                status: 'INVALID_STATUS',
            }

            const { error } = taskCreateSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/status/)
        })
    })

    // ---------------- taskUpdateSchema ----------------
    describe('taskUpdateSchema', () => {
        it('should validate valid partial update payload', () => {
            const payload = {
                status: 'DONE',
                priority: 'MEDIUM',
            }

            const { error, value } = taskUpdateSchema.validate(payload)
            expect(error).toBeUndefined()
            expect(value.status).toBe('DONE')
        })

        it('should fail if field has invalid enum value', () => {
            const payload = {
                status: 'FINISHED', // invalid
            }

            const { error } = taskUpdateSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/status/)
        })

        it('should fail if due_date is invalid ISO date', () => {
            const payload = {
                due_date: 'not-a-date',
            }

            const { error } = taskUpdateSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/due_date/)
        })

        it('should fail if due_date is in the past', () => {
            const payload = {
                due_date: new Date(Date.now() - 86400000).toISOString(),
            }

            const { error } = taskUpdateSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/due_date/)
        })
    })
})
