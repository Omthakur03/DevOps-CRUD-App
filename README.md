# DevOps CRUD App (Express.js & TypeScript Boilerplate)

A modular, robust, and production-ready Express.js application template written in **TypeScript**. This repository provides a clean folder structure and fundamental setup, ready for adding controllers, services, and routes.

## Features

- **TypeScript Implementation**: Strict compile-time checks, type-safety, and modern ES imports.
- **Modular Architecture**: Clean, pre-configured folder structure containing placeholders for routes, controllers, services, repositories, and config.
- **Security Middlewares**: Configured with `helmet` for secure HTTP headers and `cors` for cross-origin requests.
- **Error Handling**: Centralized global error handling middleware returning clean JSON responses.
- **Logging**: Morgan HTTP request logging in development mode.
- **Graceful Shutdown**: Automatically shuts down and closes server connections on termination signals (`SIGINT`, `SIGTERM`).

---

## Directory Structure

```
├── src/
│   ├── config/              # Config files (e.g., database clients, third-party API configurations)
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
   - Copy `.env.example` to create `.env` (it contains default configuration like `PORT`):
     ```bash
     cp .env.example .env
     ```

3. **Run the Application**:
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
- **Description**: Returns the current status, timestamp, and process uptime.
- **Response**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-07-09T06:19:31.964Z",
    "uptime": "12s"
  }
  ```

