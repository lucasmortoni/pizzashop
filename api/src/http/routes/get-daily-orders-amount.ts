import Elysia from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import dayjs from 'dayjs'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, count, eq, gte, sql } from 'drizzle-orm'

export const getDailyOrdersAmount = new Elysia()
  .use(auth)
  .get('/metrics/daily-orders-amount', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const today = dayjs()
    const yesterday = today.subtract(1, 'day')

    const startOfYesterday = yesterday.startOf('day')

    const ordersPerDay = await db
      .select({
        dayWithMonthAndYear: sql<string>`TO_CHAR(${orders.created_at}, 'YYYY-MM-DD')`,
        amount: count()
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurant_id, restaurantId),
          gte(orders.created_at, startOfYesterday.toDate())
        )
      )
      .groupBy(sql`TO_CHAR(${orders.created_at}, 'YYYY-MM-DD')`)

    const todayWithMonthAndYear = today.format('YYYY-MM-DD')
    const yesterdayWithMonthAndYear = yesterday.format('YYYY-MM-DD')

    const todayOrdersAmount = ordersPerDay.find((ordersPerDay) => {
      return ordersPerDay.dayWithMonthAndYear === todayWithMonthAndYear
    })
    const yesterdayOrdersAmount = ordersPerDay.find((ordersPerDay) => {
      return ordersPerDay.dayWithMonthAndYear === yesterdayWithMonthAndYear
    })

    const diffFromYesterday =
      todayOrdersAmount && yesterdayOrdersAmount
        ? (todayOrdersAmount.amount * 100) / yesterdayOrdersAmount.amount
        : null

    return {
      amount: todayOrdersAmount?.amount,
      diffFromYesterday: diffFromYesterday
        ? Number((diffFromYesterday - 100).toFixed(2))
        : 0
    }
  })
