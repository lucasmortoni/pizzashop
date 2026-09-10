import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../errors/unauthorized-error'
import z from 'zod'
import { createSelectSchema } from 'drizzle-zod'
import { orders, users } from '../../db/schema'
import { and, count, desc, eq, sql } from 'drizzle-orm'

export const getOrders = new Elysia().use(auth).get(
  '/orders',
  async ({ getCurrentUser, query }) => {
    const { restaurantId } = await getCurrentUser()

    const { customerName, orderId, status, pageIndex } = query

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const baseQuery = db
      .select({
        orderId: orders.id,
        createdAt: orders.created_at,
        status: orders.status,
        total: orders.total_in_cents,
        customerName: users.name
      })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.customer_id))
      .where(
        and(
          restaurantId ? eq(orders.restaurant_id, restaurantId) : undefined,
          orderId ? eq(orders.id, orderId) : undefined,
          status ? eq(orders.status, status) : undefined,
          customerName ? eq(users.name, customerName) : undefined
        )
      )

    const [countQuery, allOrders] = await Promise.all([
      db.select({ count: count() }).from(baseQuery.as('baseQuery')),
      db
        .select()
        .from(baseQuery.as('baseQuery'))
        .offset(pageIndex * 10)
        .limit(10)
        .orderBy((fields) => {
          return [
            sql`CASE ${fields.status} 
              WHEN 'pending' THEN 1
              WHEN 'processing' THEN 2
              WHEN 'delivering' THEN 3
              WHEN 'delivered' THEN 4
              WHEN 'canceled' THEN 99
            END`,
            desc(fields.createdAt)
          ]
        })
    ])

    const amountOfOrders = countQuery[0]?.count
    return {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: amountOfOrders
      }
    }
  },
  {
    query: z.object({
      customerName: z.optional(z.string()),
      orderId: z.optional(z.string()),
      // z.optional(createSelectSchema(ordersStatusEnum))
      // z.optional(z.enum(['pending', 'processing', 'delivering', 'delivered', 'canceled']))
      status: z.optional(createSelectSchema(orders).shape.status),
      pageIndex: z.coerce.number().min(0)
    })
  }
)
