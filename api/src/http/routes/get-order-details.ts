import Elysia from 'elysia'
import { auth } from '../auth'
import z from 'zod'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'

export const getOrderDetails = new Elysia().use(auth).get(
  '/orders/:id',
  async ({ getCurrentUser, params, set }) => {
    const { id: orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      columns: {
        id: true,
        status: true,
        total_in_cents: true,
        created_at: true
      },
      with: {
        customer: {
          columns: {
            name: true,
            phone: true,
            email: true
          }
        },
        items: {
          columns: {
            id: true,
            price_in_cents: true,
            quantity: true
          },
          with: {
            product: {
              columns: {
                name: true
              }
            }
          }
        }
      },
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

    return order
  },
  {
    params: z.object({
      id: z.string()
    })
  }
)
