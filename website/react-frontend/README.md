React frontend for the InspectionWale website (Vite)

Quick start

1. cd react-frontend
2. npm install
3. If you run the server locally, copy .env.example to .env and set VITE_API_BASE=http://localhost:4000
4. npm run dev

Build for production

- npm run build

Notes on API

- The callback form posts to `${VITE_API_BASE}/api/callback`. When VITE_API_BASE is empty, it will post to the same origin.
