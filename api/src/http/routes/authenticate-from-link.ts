import Elysia from 'elysia'
import z from 'zod'
import { db } from '../../db/connection'
import dayjs from 'dayjs'
import { auth } from '../auth'
import { authLinks } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, signUser, redirect }) => {
    const { code, redirect_url } = query

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      }
    })

    if (!authLinkFromCode) {
      throw new Error('Auth link not found')
    }

    const daysSinceAuthLinkWasCreated = dayjs().diff(
      authLinkFromCode.created_at,
      'days'
    )

    if (daysSinceAuthLinkWasCreated > 7) {
      throw new Error('Auth link expired, generate a new one')
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.manager_id, authLinkFromCode.userId)
      }
    })

    await signUser({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant?.id
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    // set.redirect = redirect_url
    redirect(redirect_url)
  },
  {
    query: z.object({
      code: z.string(),
      redirect_url: z.string()
    })
  }
)
