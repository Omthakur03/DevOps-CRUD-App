# DevOps CRUD App (Express.js & TypeScript Boilerplate with Prisma ORM)

A modular, robust, and production-ready Express.js application template written in **TypeScript** using **Prisma ORM** for database interaction. This repository provides a clean folder structure and database setup, ready for adding controllers, services, repositories, and routes.

## Features

- **TypeScript Implementation**: Strict compile-time checks, type-safety, and modern ES imports.
- **Database ORM Integration**: Prisma ORM setup configured for database access, with a pre-configured singleton client.
- **Modular Architecture**: Clean, pre-configured folder structure separating routes, controllers, services, repositories, and configurations.
- **Security Middlewares**: Configured with `helmet` for secure HTTP headers and `cors` for cross-origin requests.
- **Error Handling**: Centralized global error handling middleware returning clean JSON responses.
- **Logging**: Morgan HTTP request logging in development mode.
- **Graceful Shutdown**: Automatically shuts down and closes server connections / Prisma connections on termination signals (`SIGINT`, `SIGTERM`).

---

## Directory Structure

```
├── prisma/
│   └── schema.prisma        # Prisma schema file defining datasource, generator, and models
├── src/
│   ├── config/
│   │   └── db.ts            # Prisma client instance singleton configuration
│   ├── repositories/        # Database CRUD operations layer
│   ├── services/            # Core business logic layer
│   ├── controllers/         # Handles HTTP requests and responses
│   ├── middleware/
│   │   └── errorHandler.ts  # Global centralized error handler
│   ├── routes/              # Route declarations mapping to controllers
│   ├── app.ts               # Express application initialization and middleware setup
│   └── server.ts            # Express server listener and process management
├── .env                     # Local configuration and environment variables
├── .env.example             # Shared template for environment variables
├── .gitignore               # Ignored files list (including node_modules/ and dist/)
├── tsconfig.json            # TypeScript compiler configuration
├── package.json             # NPM package manifest
└── README.md                # Documentation (this file)
```

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   - Copy `.env.example` to create `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `DATABASE_URL` in `.env` with your actual database credentials.

3. **Prisma Setup**:
   - Run the Prisma migration tool to set up database schemas:
     ```bash
     npx prisma migrate dev
     ```
   - Generate the Prisma Client locally:
     ```bash
     npx prisma generate
     ```

4. **Run the Application**:
   - Run in development mode (with hot-reload using `ts-node-dev`):
     ```bash
     npm run dev
     ```
   - Build for production (compiles TS into JavaScript inside the `dist/` directory):
     ```bash
     npm run build
     ```
   - Start in production mode (runs the compiled JavaScript):
     ```bash
     npm start
     ```

---

## API Documentation

### Health Check

- **Endpoint**: `GET /health`
- **Description**: Returns the current status, timestamp, process uptime, and database connectivity.
- **Response**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-07-09T06:19:31.964Z",
    "uptime": "12s",
    "database": "UP"
  }
  ```

### Products API

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | Retrieve all products | None |
| **GET** | `/api/products/:id` | Get product details by ID | None |
| **POST** | `/api/products` | Create a new product | JSON body with fields (see below) |
| **PUT** | `/api/products/:id` | Update product details | JSON body with fields (see below) |
| **DELETE** | `/api/products/:id` | Delete a product | None |

#### Create Product Request Body:
```json
{
  "name": "Super Coffee Maker",
  "description": "High quality espresso machine",
  "price": 149.99,
  "sku": "COFFEE-M-01",
  "stock": 50
}
```
*Note: `name`, `price`, and `sku` (must be unique) are required.*



