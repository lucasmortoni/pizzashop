import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { orderItems, restaurants, users } from '.'
import { relations } from 'drizzle-orm'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'delivering',
  'delivered',
  'canceled'
])

export const orders = pgTable('orders', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  customer_id: text('customer_id').references(() => users.id, {
    onDelete: 'set null'
  }),
  restaurant_id: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id, {
      onDelete: 'cascade'
    }),
  status: orderStatusEnum('status').default('pending').notNull(),
  total_in_cents: integer('total_in_cents').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
})

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customer_id],
    references: [users.id],
    relationName: 'order_customer'
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurant_id],
    references: [restaurants.id],
    relationName: 'order_restaurant'
  }),
  items: many(orderItems)
}))
