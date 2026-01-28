# Competitor Stalker 🕵️

A competitive intelligence dashboard for tracking and analyzing competitor strategies, pricing, positioning, and market presence.

## Features

- **Dashboard** - Central hub with real-time competitive intelligence overview
- **Competitor Dossier** - Detailed profiles and intelligence on competitors
- **Positioning Map** - Visual mapping of market positioning and competitive landscape
- **Feature Matrix** - Comparative analysis of competitor features
- **Pricing Intelligence** - Monitor and analyze competitor pricing strategies
- **Social Surveillance** - Track competitor social media presence and engagement
- **Weakness Spotter** - Identify vulnerabilities and market gaps
- **Counter Strategy** - Develop strategic responses to competitive threats
- **Movement Alerts** - Real-time notifications for competitor activity changes

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with PostCSS
- **Routing**: React Router 7
- **Icons**: Lucide React
- **Linting**: ESLint with TypeScript support

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the dev server at `http://localhost:5173` with hot module replacement (HMR).

### Build

```bash
npm run build
```

Builds the application for production with type checking and optimization.

### Lint

```bash
npm run lint
```

Runs ESLint to check code quality and style compliance.

### Preview

```bash
npm run preview
```

Preview the production build locally.

## Project Structure

```
src/
├── pages/              # Route pages
├── components/
│   ├── common/        # Reusable UI components (Button, Card, Input)
│   ├── features/      # Feature-specific components
│   └── layout/        # Layout components
├── context/           # React Context for state management
├── hooks/             # Custom React hooks
├── services/          # API and external service integrations
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── styles/            # Global styles and CSS modules
└── constants/         # App constants
```

## Development Notes

- Uses TypeScript for type safety across the application
- Components are code-split using React lazy loading for optimal performance
- ESLint configured for React best practices
- Tailwind CSS for utility-first styling
