import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { orders, products } from '.'
import { relations } from 'drizzle-orm'

export const orderItems = pgTable('order_items', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  order_id: text('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade'
    }),
  product_id: text('product_id').references(() => products.id, {
    onDelete: 'set null'
  }),
  price_in_cents: integer('price_in_cents').notNull(),
  quantity: integer('quantity').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
})

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  restaurant: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
    relationName: 'order_item_restaurant'
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
    relationName: 'order_item_product'
  })
}))
