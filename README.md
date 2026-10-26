# Sarah's Pilates

A full-stack web application for managing Pilates classes and resources.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Apollo Client
- **Backend:** Node.js, Express, Apollo Server, GraphQL
- **Database:** MongoDB / Mongoose
- **Auth:** JWT, bcryptjs

## Project Structure

```
Sarah_Pilates/
├── clean-sarahs-pilates-client/   # React frontend
└── server/                        # Node.js/GraphQL backend
```

## Getting Started

### Prerequisites

- Node.js >= 22.12.0

### Install

```bash
npm install
```

This installs dependencies for both the client and server.

### Environment Variables

Create a `.env` file in the root with the required variables (see `.env.example` if available).

### Development

```bash
# Run frontend
cd clean-sarahs-pilates-client && npm run dev

# Run backend
cd server && npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Deployment

This project is configured for deployment with [Nixpacks](https://nixpacks.com). The `nixpacks.toml` at the root handles the build and start commands automatically.

## License

See [LICENSE](./LICENSE).
