# FloAgenticAI 🤖✨

**A simple yet powerful no-code drag-and-drop multi-agent AI workflow builder platform.**

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)

## ✨ Key Features

### 🎨 Visual Workflow Builder

- **Intuitive Drag-and-Drop Interface**: Design complex workflows using ReactFlow-powered visual editor
- **Node-Based Architecture**: Connect different AI agents, triggers, and actions with simple visual connections
- **Real-time Preview**: See your workflow in action as you build it

### 🤖 Multi-Agent AI Integration

- **Multiple AI Providers**: Seamlessly integrate with OpenAI, Google Gemini, and other leading AI services
- **Agent Specialisation**: Create specialised agents for different tasks (content creation, analysis, decision-making)
- **Intelligent Routing**: Automatically route tasks to the most appropriate agent based on context
- **MCP (Modal Context Protocol)**: Enhance agents' capabilities by integrating with various MCP servers.

### ⚡ Powerful Execution Engine

- **Distributed Processing**: Powered by Hatchet.run for scalable, distributed workflow execution
- **Real-time Monitoring**: Track workflow execution with live updates via Socket.IO
- **Error Handling**: Robust error handling and retry mechanisms

### 💬 Interactive Chat Interface

- **Conversational Workflows**: Build chat-based interfaces for your AI workflows
- **Message History**: Complete chat history and context management
- **Multi-turn Conversations**: Support for complex, context-aware conversations

## 🏗️ Architecture

FloAgenticAI is built as a modern TypeScript monorepo with a clear separation of concerns:

```
FloAgenticAI/
├── apps/
│   ├── frontend/          # React 19 SPA with visual workflow builder
│   └── backend/           # Express.js API with workflow execution engine
└── packages/
    └── common/            # Shared types and utilities
```

### Backend Architecture

- **RESTful APIs**: Express based API endpoints with Zod validation
- **Service Layer**: Domain-separated business logic (workflows, chat, credentials, users)
- **Database Layer**: MikroORM with PostgreSQL for data persistence, and Redis for Pub/Sub and caching
- **Real-time Communication**: Socket.IO for live workflow updates and chat
- **Workflow Engine**: Hatchet.run integration for distributed execution

### Frontend Architecture

- **File-based Routing**: TanStack Router for type-safe navigation
- **State Management**: Zustand for UI state, TanStack Query for server state
- **Component Architecture**: Modular, reusable components with HeroUI design system
- **Visual Editor**: XYFlow/ReactFlow for the workflow builder interface

## 🛠️ Tech Stack

### Core Technologies

- **Language**: [TypeScript](https://www.typescriptlang.org/) (ESM)
- **Frontend**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Backend**: [Express.js v5](https://expressjs.com/) with Node.js
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [MikroORM v6](https://mikro-orm.io/)

### Frontend Stack

- **Routing**: [TanStack Router v1](https://tanstack.com/router/latest)
- **State Management**: [Zustand v5](https://zustand.docs.pmnd.rs/) + [TanStack Query v5](https://tanstack.com/query/latest)
- **UI Framework**: [HeroUI v2.7](https://www.heroui.com/)
- **Styling**: [TailwindCSS v3.4](https://tailwindcss.com/)
- **Workflow Builder**: [ReactFlow v12](https://reactflow.dev/) (@xyflow/react)
- **Animations**: [Framer Motion](https://motion.dev/)

### Backend Stack

- **API Framework**: Express.js with Socket.IO
- **Workflow Engine**: [Hatchet.run](https://hatchet.run/)
- **Authentication**: [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- **Caching**: [Redis](https://redis.io/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/), OpenAI SDK, Google Gemini

### Development & DevOps

- **Monorepo**: [Turborepo](https://turborepo.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Code Quality**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [Husky](https://typicode.github.io/husky/)
- **Testing**: [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)

## 🚀 Getting Started

Ready to start building? Check out our comprehensive development guide:

**📖 [Development Setup Guide](DEV_SETUP.md)**

The setup guide covers:

- Prerequisites and installation
- Environment configuration
- Docker setup for services
- Database initialization
- Starting development servers

## 🔧 Available Scripts

### Root Level Commands

```bash
pnpm dev              # Start both frontend and backend
pnpm build            # Build all packages
pnpm lint             # Run linting across all packages
pnpm lint:fix         # Fix linting issues
pnpm check-types      # TypeScript type checking
pnpm format           # Format code with Prettier
```

### Backend Commands (from `apps/backend/`)

```bash
pnpm dev              # Start backend with hot reload
pnpm db:schema:update # Update database schema
```

### Frontend Commands (from `apps/frontend/`)

```bash
pnpm dev              # Start Vite dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow our coding guidelines**: Use conventional commits, maintain type safety
4. **Test your changes**: Run `pnpm lint` and `pnpm check-types`
5. **Submit a pull request**: Target the `development` branch

### Development Workflow

- Feature branches should be created from `development`
- Use conventional commit messages (`feat:`, `fix:`, `chore:`, etc.)
- Ensure all type checks and lints pass before submitting PRs

## 📄 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

## 🌐 Links & Support
- **Contact**: zubairkhalidce@gmail.com
- **Issues**: [GitHub Issues](https://github.com/dearzubi/floagenticai/issues)

## 🙏 Acknowledgments

Built with ❤️, powered by an incredible ecosystem of open-source tools and the vibrant AI community.

---

**Ready to build the future of AI automation?** 🚀

Start by exploring our [Development Setup Guide](DEV_SETUP.md) and join the community of builders creating the next generation of intelligent workflows.
