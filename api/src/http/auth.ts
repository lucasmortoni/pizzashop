import { Elysia } from 'elysia'
import { env } from '../env'
import jwt from '@elysiajs/jwt'
import z from 'zod'
import { UnauthorizedError } from './errors/unauthorized-error'

const jwtPayload = z.object({
  sub: z.string(),
  restaurantId: z.optional(z.string())
})

type Payload = z.infer<typeof jwtPayload>

export const auth = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED': {
        set.status = 401
        return { code, message: error.message }
      }
    }
  })
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload
    })
  )
  .derive({ as: 'scoped' }, ({ jwt, cookie }) => {
    return {
      signUser: async (payload: Payload) => {
        const token = await jwt.sign(payload)

        cookie.auth?.set({
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
          value: token
        })
      },
      signOut: async () => {
        cookie.auth?.remove()
      },
      getCurrentUser: async () => {
        const payload = await jwt.verify(cookie.auth?.toString())
        if (!payload) {
          throw new UnauthorizedError()
        }

        return {
          userId: payload.sub,
          restaurantId: payload.restaurantId
        }
      }
    }
  })
