# Kasephal — UI

> Next.js frontend for Kasephal, an agricultural marketplace that connects farmers and buyers for secure crop trading with escrow-backed contracts.

## Tech Stack

- **Next.js** 16+ (App Router)
- **React** 19+
- **TypeScript**
- **Tailwind CSS** 4 — styling
- **React Hook Form** + **Zod** — form validation
- **Recharts** — charts & analytics
- **Handsontable** — data tables
- **Sonner** — toast notifications

## Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) / [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/14th-Gen-Basic-Course-Final-Project/Kasephal-UI.git
cd Kasephal-UI
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and fill in your values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will start at `http://localhost:3000`.

### 5. Verify

Open [http://localhost:3000](http://localhost:3000) in your browser. Make sure the backend API is running for full functionality.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Connecting to the API

The UI expects the backend API to be running at the URL specified in `NEXT_PUBLIC_API_URL`. Make sure to:

1. Start the API server first
2. Ensure CORS is configured on the API to allow `http://localhost:3000`

## Production Build

```bash
npm run build
npm run start
```

For deployment, set all environment variables on your hosting platform (Docker, VPS, etc.) and ensure `NEXT_PUBLIC_API_URL` points to your production API.