# FloAgenticAI 🤖

FloAgenticAI is a modern platform designed for building and automating intelligent AI workflows. It enables you to create, customize, and deploy sophisticated workflows powered by AI agents. Whether you're automating business processes, creating intelligent assistants, or building complex AI-driven workflows, FloAgenticAI transforms your ideas into powerful, production-ready solutions without the technical complexity.

## ✨ Features

- **Visual Builder** - Intuitive drag-and-drop interface to design your AI workflows
- **AI Integration** - Seamlessly connect with powerful AI models and tools
- **Easy Deployment** - Deploy your sophisticated AI workflows with just a few clicks

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- PNPM package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/dearzubi/floagenticai && cd floagenticai
```

2. Install dependencies:

```bash
pnpm install
```

### ⚙️ Environment Configuration

#### Frontend Environment Variables (.env)

Create a `.env` file in the `apps/frontend` directory with the following variables:

Firebase Configuration:

- `VITE_FIREBASE_API_KEY`=your_api_key
- `VITE_FIREBASE_AUTH_DOMAIN`=your_domain.firebaseapp.com
- `VITE_FIREBASE_PROJECT_ID`=your_project_id
- `VITE_FIREBASE_STORAGE_BUCKET`=your_storage_bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`=your_sender_id
- `VITE_FIREBASE_APP_ID`=your_app_id
- `VITE_FIREBASE_MEASUREMENT_ID`=your_measurement_id

These variables are used for [Firebase web sdk](https://www.npmjs.com/package/firebase):

- Firebase Authentication
- Firebase Cloud Storage
- Firebase Analytics

#### Backend Environment Variables (.env)

Create a `.env` file in the `apps/backend` directory with the following variables:

PostgreSQL Database Configuration:

- `DATABASE_HOST`=your_pg_database_host
- `DATABASE_PORT`=your_pg_database_port
- `DATABASE_USER`=your_pg_database_username
- `DATABASE_PASSWORD`=your_pg_database_password
- `DATABASE_NAME`=your_pg_database_name

Server Configuration:

- `NODE_ENV`=development | production
- `PORT`=server_port

Firebase Admin Configurations:

You need to get the following variables from your Firebase service account JSON file.
They are used to set up and access [Firebase admin sdk](https://www.npmjs.com/package/firebase-admin).

- `FIREBASE_PROJECT_ID`=your_project_id
- `FIREBASE_PRIVATE_KEY`=your_private_key
- `FIREBASE_CLIENT_EMAIL`=your_client_email

### Start the development server:

```bash
pnpm dev
```

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/)
- **Backend:** [Express.js v5](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database Management:**
  - Database: [PostgreSQL](https://www.postgresql.org/)
  - ORM: [MikroORM](https://mikro-orm.io/)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest)
- **State Management:**
  - Synchronous: [Zustand](https://zustand.docs.pmnd.rs/)
  - Asynchronous: [TanStack Query](https://tanstack.com/query/latest)
- **UI Components:** [HeroUI](https://www.heroui.com/)
- **Styling:** [TailwindCSS V3](https://v3.tailwindcss.com/)
- **Animations:** [Framer Motion](https://motion.dev/)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Testing Frontend:** [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Code Quality:**
  - [ESLint/TS-ESLint](https://typescript-eslint.io/)
  - [Prettier](https://prettier.io/)
  - [Husky for Git hooks](https://typicode.github.io/husky/)
- **CI/CD:**
  - [GitHub Actions](https://github.com/features/actions)
  - [Release It](https://github.com/release-it/release-it)

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests
- `pnpm lint` - Run linting
- `pnpm lint:fix` - Fix linting issues
- `pnpm check-types` - Check TypeScript types
- `pnpm coverage` - Run tests with coverage report

## 📄 License

This project is licensed under the terms of [the Apache 2.0](LICENSE) license.

## 📞 Support

If you have any questions, need help, or have an awesome suggestion, please open an issue in the repository or visit [https://sagestudios.ai/contact](https://sagestudios.ai/contact)

---

Built with ❤️, ☕, and an army of AI agents working overtime 🤖
