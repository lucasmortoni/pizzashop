/* eslint-disable drizzle/enforce-delete-with-where */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { faker } from '@faker-js/faker'
import {
  users,
  restaurants,
  orderItems,
  orders,
  products,
  authLinks
} from './schema'
import { db } from './connection'
import { createId } from '@paralleldrive/cuid2'

/**
 * Reset all data in the database
 */
await Promise.all([
  db.delete(users),
  db.delete(restaurants),
  db.delete(orderItems),
  db.delete(orders),
  db.delete(products),
  db.delete(authLinks)
])

/**
 * Create customers
 */

const [customer1, customer2] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer'
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer'
    }
  ])
  .returning()

/**
 * Create a manager
 */
const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
      role: 'manager'
    }
  ])
  .returning({
    id: users.id
  })

if (!manager) {
  throw new Error('Failed to create manager')
}

/**
 * Create restaurants
 */
const [restaurant] = await db
  .insert(restaurants)
  .values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      manager_id: manager.id
    }
  ])
  .returning()

/**
 * Create products
 */
function generateProduct() {
  return {
    name: faker.commerce.productName(),
    restaurant_id: restaurant!.id,
    description: faker.commerce.productDescription(),
    price_in_cents: Number(faker.commerce.price({ min: 190, max: 490, dec: 0 }))
  }
}
const availableProducts = await db
  .insert(products)
  .values([
    generateProduct(),
    generateProduct(),
    generateProduct(),
    generateProduct(),
    generateProduct()
  ])
  .returning()

/**
 * Create orders
 */
type OrderItemsInsert = typeof orderItems.$inferInsert
type OrderInsert = typeof orders.$inferInsert

const orderItemsToInsert: OrderItemsInsert[] = []
const ordersToInsert: OrderInsert[] = []

for (let i = 0; i < 200; i++) {
  const orderId = createId()
  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 3
  })

  let totalInCents = 0

  orderProducts.forEach((orderProduct) => {
    const quantity = faker.number.int({ min: 1, max: 3 })
    totalInCents += orderProduct.price_in_cents * quantity

    orderItemsToInsert.push({
      order_id: orderId,
      price_in_cents: orderProduct.price_in_cents,
      quantity,
      product_id: orderProduct.id
    })
  })

  ordersToInsert.push({
    id: orderId,
    customer_id: faker.helpers.arrayElement([customer1!.id, customer2!.id]),
    restaurant_id: restaurant!.id,
    total_in_cents: totalInCents,
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'delivering',
      'delivered',
      'canceled'
    ]),
    created_at: faker.date.recent({ days: 40 })
  })
}

await db.insert(orders).values(ordersToInsert)
await db.insert(orderItems).values(orderItemsToInsert)

console.log('Seeded database with:')
console.log('- Users:', 2)
console.log('- Restaurants:', 1)
console.log('- Products:', 5)
console.log('- Orders:', 200)

process.exit()
