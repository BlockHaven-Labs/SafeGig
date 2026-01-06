# SafeGig Backend

The backend API for the SafeGig platform, built with **NestJS**, **TypeORM**, and **PostgreSQL**.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later)
- **Yarn** (package manager)
- **PostgreSQL** (database)

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
yarn install
```

---

### 2. Environment Configuration

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Open `.env` and configure your local PostgreSQL credentials:

```ini
PORT=3000

# Database Settings
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=safegig_dev
```

---

### 3. Database & Migrations

This project uses **TypeORM** to manage the database schema. You must run migrations to set up the database tables (for example, the `users` table).

#### Run Migrations (Apply Schema)

```bash
# Using the package.json script (recommended)
yarn migration:run

# Alternative (direct TypeORM CLI command)
npx typeorm-ts-node-commonjs migration:run -d ./data-source.ts
```

#### Generate Migrations (After Changing Entities)

If you modify an entity (for example, adding a field to `User`), generate a new migration file:

```bash
yarn migration:generate src/migrations/NameOfChange
```

#### Revert Last Migration

To undo the most recent migration:

```bash
yarn migration:revert
```

---

### 4. Running the App

Start the application in development mode:

```bash
yarn start:dev
```

The server will start at:

```
http://localhost:3000
```

You can verify it is running by checking the health status endpoint:

```
GET http://localhost:3000/
```

---

## 📂 Project Structure

```
src/
├── database/         # Global database module and connection logic
├── migrations/       # Generated database migration files
├── modules/          # Feature-specific modules
│   ├── auth/
│   ├── users/
│   ├── jobs/
│   ├── escrow/
│   ├── messaging/
│   ├── notifications/
│   └── files/
└── main.ts           # Application entry point

# TypeORM CLI configuration
data-source.ts
```

---

## 🛠 Available Scripts

- `yarn start`: Start the application
- `yarn start:dev`: Start the application in watch mode
- `yarn build`: Compile the project to the `dist` folder
- `yarn lint`: Run ESLint to check for code quality issues
- `yarn format`: Format code using Prettier
- `yarn migration:run`: Run database migrations
- `yarn migration:generate`: Generate a new migration
- `yarn migration:revert`: Revert the last migration

---

## 📄 Notes

- Ensure PostgreSQL is running before executing migrations.
- Always generate and commit migration files when modifying entities.
- Use **Yarn** consistently for dependency management and scripts.
