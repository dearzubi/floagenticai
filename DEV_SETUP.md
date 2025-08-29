# FloAgenticAI Development Guide

This guide provides step-by-step instructions to set up a development environment for FloAgenticAI. Follow these steps to get started quickly. The project is built using [Turborepo](https://turborepo.com/) Monorepo structure. There are following apps and packages in the repo:
- `apps/frontend`: The web application built with Vite and React.
- `apps/backend`: The backend built with Node.js and Express.
- `packages/common`: A shared package for common utilities and types between frontend and backend.

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
- Node.js (version 22.x or later)
  - Recommended way is to install via [nvm](https://github.com/nvm-sh/nvm)
- pnpm (version 9.x or later)
  - Install via npm: `npm install -g pnpm`
- Git
  - Follow this guide to install: [Git Installation Guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- Docker
    - Follow the official installation guide: [Docker Installation Guide](https://docs.docker.com/get-docker/)
- A code editor (e.g., VSCode, WebStorm)
- Firebase Project (for user authentication)
  - Create a new project in the [Firebase Console](https://console.firebase.google.com/)
  - Enable Authentication (Email/Password and Google/GitHub Sign-In)

## Step 1: Clone the Repository
Open your terminal and run the following command to clone the FloAgenticAI repository:
```bash
git clone https://github.com/dearzubi/floagenticai
cd floagenticai
```

## Step 2: Install Dependencies
Run the following command to install all necessary dependencies using pnpm:
```bash
pnpm install
```

## Step 3: Set Up Environment Variables
* Visit each app directory and create a `.env` file based on the provided `.sample_env` files. You can copy the example file and modify it as needed
* For `ENCRYPTION_KEY`, you can generate a random key using the following command:
```bash
openssl rand -base64 32
```
* You can leave `HATCHET_CLIENT_TOKEN` for now and we will get back to it later.

## Step 4: Run Docker Containers
Make sure Docker is running on your machine. Then, run the following command to start the necessary Docker containers:
```bash
cd apps/backend
docker compose -f docker-compose.dev.services.yml up -d
```
Wait for the command to finish and the containers to start before proceeding to the next step.

## Step 5: Set Up HATCHET_CLIENT_TOKEN
Run the following command in the `apps/backend` directory to generate a client token for Hatchet:
```bash
docker compose -f docker-compose.dev.services.yml run --no-deps hatchet-setup-config /hatchet/hatchet-admin token create --config /hatchet/config --tenant-id 707d0855-80ab-4e1f-a156-f1c4546cbf52
```
Copy the generated token and assign it to the `HATCHET_CLIENT_TOKEN` variable `.env` file in the `apps/backend`.

## Step 6: Setup Database
Run the following command in the `apps/backend` to set up the database schema:
```bash
pnpm db:schema:update -r
```

## Step 7: Build the Project
Run the following command in the root directory to build both the frontend and backend:
```bash
pnpm build
```
This is required for the first time to ensure all packages are built correctly.

## Step 8: Start the Development Servers
Run the following command in the root directory to start both the frontend and backend development servers:
```bash
pnpm dev
```
* This should start the frontend server on `http://localhost:5173` and the backend server on configured port (default is `http://localhost:4000`).
* From terminal logs, ensure following:
  * Database is initialised and connected
  * Redis is connected
  * Hatchet is connected and workers are started
  * Socket.io is connected

If you encounter any issues, check the terminal output for error messages and ensure all services are running correctly and contact the project maintainer if needed.

**Note:** If you make changes to the shared package `packages/common`, you need to rebuild it for the changes to take effect. You can do this by running:
```bash
pnpm --filter common build
```