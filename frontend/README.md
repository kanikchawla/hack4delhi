# Government of India - Caller Frontend

Modern React frontend for the Government of India AI Voice Calling System.

## Features

- **Sophisticated UI**: Modern, responsive design with sidebar navigation
- **Dashboard**: View inbound and outbound call logs with real-time updates
- **Contact Information**: Comprehensive contact details for Government of India services
- **Outbound Calling**: Initiate calls to multiple numbers with custom messages

## Tech Stack

- React 19
- Vite
- Lucide React (Icons)
- Modern CSS with CSS Variables

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Backend Integration

The frontend is configured to proxy API requests to the Flask backend running on `http://localhost:5000`. Make sure the Flask backend is running when using the frontend.
