# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a full-stack ecommerce store (ShopNow) with a React + Vite frontend and Express API backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifacts/ecommerce-store)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Routing**: wouter (frontend)
- **State**: TanStack React Query

## Features

- Homepage with hero banner, featured products, category grid, and store stats
- Product listing with search, category filter, sorting, and pagination
- Product detail page with ratings, related products, and add-to-cart
- Shopping cart with quantity management
- Checkout form with order creation
- Order history and order detail pages
- 6 categories: Electronics, Clothing, Home & Living, Sports, Beauty, Books
- 16 seeded products with real images

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `categories` — product categories with slug, description, imageUrl
- `products` — full product info with price, rating, stock, badges, tags
- `cart_items` — session-based cart items
- `orders` + `order_items` — completed orders

## Notes

- Cart uses a hardcoded session ID (`default-session`) — no auth required
- API spec: `lib/api-spec/openapi.yaml`
- The `lib/api-zod/src/index.ts` only exports from `./generated/api` (not types) to avoid barrel conflicts
