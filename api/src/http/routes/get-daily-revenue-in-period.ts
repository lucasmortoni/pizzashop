import Elysia from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import dayjs from 'dayjs'
import z from 'zod'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, asc, eq, gte, lte, sql, sum } from 'drizzle-orm'

export const getDailyRevenueInPeriod = new Elysia().use(auth).get(
  '/metrics/daily-revenue-in-period',
  async ({ getCurrentUser, query, set }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const { from, to } = query

    const startDate = from ? dayjs(from) : dayjs().subtract(7, 'days')
    const endDate = to ? dayjs(to) : from ? startDate.add(7, 'days') : dayjs()

    if (endDate.diff(startDate, 'days') > 7) {
      set.status = 400
      return {
        error: 'The selected date range must not exceed 7 days.'
      }
    }

    const revenuePerDay = await db
      .select({
        date: sql<string>`TO_CHAR(${orders.created_at}, 'MM-DD')`,
        revenue: sum(orders.total_in_cents).mapWith(Number)
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurant_id, restaurantId),
          gte(
            orders.created_at,
            startDate
              .startOf('day')
              .add(startDate.utcOffset(), 'minutes')
              .toDate()
          ),
          lte(
            orders.created_at,
            endDate.endOf('day').add(endDate.utcOffset(), 'minutes').toDate()
          )
        )
      )
      .groupBy(sql`TO_CHAR(${orders.created_at}, 'MM-DD')`)
      .orderBy((fields) => {
        return asc(fields.date)
      })

    return revenuePerDay
  },
  {
    query: z.object({
      from: z.optional(z.string()),
      to: z.optional(z.string())
    })
  }
)
