# HireGenie — Frontend

React 19 + Vite frontend for the HireGenie platform.

## Setup

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Structure

```
src/
├── components/
│   ├── common/         # ProtectedRoute, Loading, etc.
│   ├── layout/         # Navbar, Footer
│   └── ui/             # Buttons, inputs, cards
├── context/            # AuthContext, ThemeContext
├── hooks/              # Custom React hooks
├── pages/              # Route page components
│   ├── Dashboard.jsx
│   ├── Interview.jsx
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Reports.jsx
│   └── ResumeUpload.jsx
├── services/           # Axios API instance
├── styles/             # Design system CSS
├── utils/              # Helper functions
├── App.jsx             # Root component + routing
└── main.jsx            # Entry point
```
