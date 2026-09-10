import Elysia from 'elysia'
import { auth } from '../auth'
import z from 'zod'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const deliverOrder = new Elysia().use(auth).patch(
  'orders/:id/deliver',
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

    if (order.status !== 'delivering') {
      set.status = 400
      return {
        message:
          'Order is not in delivering status. Only delivering orders can be marked as delivered.'
      }
    }

    await db
      .update(orders)
      .set({ status: 'delivered' })
      .where(eq(orders.id, orderId))
  },
  {
    params: z.object({
      id: z.string()
    })
  }
)
