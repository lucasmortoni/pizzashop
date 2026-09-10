# 🍕 PizzaShop

A cozy little project for managing a pizza shop backend, built with a modern stack and designed to grow into a full restaurant platform.

> ⚠️ Work in progress: this repository currently contains the backend implementation only. The frontend is coming soon.

## What is PizzaShop?

PizzaShop is a small, practical restaurant management experience focused on the operational side of a pizza business:

- registering restaurants
- authenticating staff through magic links
- managing orders from approval to delivery
- tracking revenue and order metrics
- surfacing popular products and daily summaries

It is intentionally backend-first right now, which means the API and business logic are the main focus before the user-facing app lands.

## ✨ Current backend features

The API already includes core flows for a restaurant admin experience, including:

- restaurant registration
- secure staff authentication via email magic links
- profile and managed restaurant retrieval
- order details and lifecycle actions:
  - approve
  - cancel
  - dispatch
  - deliver
- order listing and filtering
- revenue and order analytics such as:
  - monthly revenue
  - daily orders amount
  - monthly canceled orders
  - popular products
  - daily revenue in a period

## 🧩 Stack

This project is built with a lightweight and developer-friendly stack:

- TypeScript
- Bun
- Elysia
- PostgreSQL
- Drizzle ORM
- JWT authentication
- Nodemailer for auth emails
- Zod validation

## 📁 Repository structure

```text
pizzashop/
├── api/
│   ├── src/
│   ├── drizzle/
│   ├── package.json
│   ├── drizzle.config.ts
│   └── README.md
├── README.md
└── LICENSE
```

The full backend lives under the `api/` folder, and that is the portion implemented so far.

## 🚀 Getting started

From the API folder:

```bash
cd api
bun install
bun run dev
```

The backend will run on the local development server and expose the restaurant API routes.

## 🛠️ Scripts

Useful commands available in the API project:

```bash
bun run dev
bun run build
bun run test
bun run db:push
bun run db:generate
bun run db:migrate
bun run db:seed
```

## 🌱 Roadmap

PizzaShop is still growing, and the roadmap is very exciting:

- [x] backend foundation
- [x] authentication and restaurant flow
- [x] order management and analytics
- [ ] frontend dashboard and app experience
- [ ] polished UX for customers and admins
- [ ] richer reporting and customization

## 💡 A quick note

This project is a WIP with a warm, focused backend foundation. The goal is to keep building the business logic cleanly so the frontend can arrive with a solid base and a delicious experience.

Until then, the backend is the main star of the show — and it is already doing some serious pizza-powered work.

---

Made with a little love, lots of cheese, and a strong backend foundation. 🍕✨
