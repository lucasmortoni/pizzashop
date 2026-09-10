import Elysia from 'elysia'
import z from 'zod'
import { db } from '../../db/connection'
import { users, restaurants } from '../../db/schema'

export const registerRestaurant = new Elysia().post(
  '/restaurants',
  async ({ body, set }) => {
    const { restaurantName, managerName, email, phone } = body
    const [manager] = await db
      .insert(users)
      .values({
        name: managerName,
        email,
        phone,
        role: 'manager'
      })
      .returning({
        id: users.id
      })

    await db.insert(restaurants).values({
      name: restaurantName,
      manager_id: manager?.id
    })

    set.status = 204
  },
  {
    body: z.object({
      restaurantName: z.string(),
      managerName: z.string(),
      email: z.email(),
      phone: z.string()
    })
  }
)
