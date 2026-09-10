import Elysia from 'elysia'
import { auth } from '../auth'
import z from 'zod'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const approveOrder = new Elysia().use(auth).patch(
  'orders/:id/approve',
  async ({ params, getCurrentUser, set }) => {
    const { id: orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurant_id, restaurantId)
        )
      }
    })

    if (!order) {
      set.status = 400
      return { message: 'Order not found.' }
    }

    if (order.status !== 'pending') {
      set.status = 400
      return {
        message: 'Order is not pending. Only pending orders can be approved.'
      }
    }

    await db
      .update(orders)
      .set({ status: 'processing' })
      .where(eq(orders.id, orderId))
  },
  {
    params: z.object({
      id: z.string()
    })
  }
)
