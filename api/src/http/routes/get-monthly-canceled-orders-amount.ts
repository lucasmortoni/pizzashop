import Elysia from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import dayjs from 'dayjs'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, count, eq, gte, sql } from 'drizzle-orm'

export const getMonthlyCanceledOrdersAmount = new Elysia()
  .use(auth)
  .get(
    '/metrics/monthly-canceled-orders-amount',
    async ({ getCurrentUser }) => {
      const { restaurantId } = await getCurrentUser()

      if (!restaurantId) {
        throw new UnauthorizedError()
      }

      const today = dayjs()
      const lastMonth = today.subtract(1, 'month')
      const startOfLastMonth = lastMonth.startOf('month')

      const ordersPerMonth = await db
        .select({
          monthWithYear: sql<string>`TO_CHAR(${orders.created_at}, 'YYYY-MM')`,
          amount: count()
        })
        .from(orders)
        .where(
          and(
            eq(orders.restaurant_id, restaurantId),
            eq(orders.status, 'canceled'),
            gte(orders.created_at, startOfLastMonth.toDate())
          )
        )
        .groupBy(sql`TO_CHAR(${orders.created_at}, 'YYYY-MM')`)

      const currentMonthWithYear = today.format('YYYY-MM')
      const lastMonthWithYear = lastMonth.format('YYYY-MM')

      const currentMonthOrdersAmount = ordersPerMonth.find(
        (monthOrderAmount) => {
          return monthOrderAmount.monthWithYear === currentMonthWithYear
        }
      )
      const lastMonthOrdersAmount = ordersPerMonth.find((monthOrderAmount) => {
        return monthOrderAmount.monthWithYear === lastMonthWithYear
      })

      const diffFromLastMonth =
        currentMonthOrdersAmount && lastMonthOrdersAmount
          ? (currentMonthOrdersAmount.amount * 100) /
            lastMonthOrdersAmount.amount
          : null

      return {
        amount: currentMonthOrdersAmount?.amount,
        diffFromLastMonth: diffFromLastMonth
          ? Number((diffFromLastMonth - 100).toFixed(2))
          : 0
      }
    }
  )
