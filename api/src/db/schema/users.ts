import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { orders, restaurants } from '.'

export const userRoles = pgEnum('user_role', ['manager', 'customer'])

export const users = pgTable('users', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: userRoles('role').default('customer').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export const usersRelations = relations(users, ({ one, many }) => ({
  managed_restaurant: one(restaurants, {
    fields: [users.id],
    references: [restaurants.manager_id],
    relationName: 'managed_restaurant'
  }),
  orders: many(orders)
}))

// Drizzle v1+ relation schema
// export const usersRelations = defineRelations(
//   { users, orders, restaurants },
//   (r) => ({
//     users: {
//       managed_restaurant: r.one.restaurants({
//         from: r.users.id,
//         to: r.restaurants.manager_id
//       }),
//       orders: r.many.orders({})
//     }
//   })
// )
