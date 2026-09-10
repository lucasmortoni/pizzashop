import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { orderItems, restaurants } from '.'
import { relations } from 'drizzle-orm'

export const products = pgTable('products', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price_in_cents: integer('price_in_cents').notNull(),
  restaurant_id: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id, {
      onDelete: 'cascade'
    }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export const productsRelations = relations(products, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [products.restaurant_id],
    references: [restaurants.id],
    relationName: 'product_restaurant'
  }),
  orders: many(orderItems)
}))
