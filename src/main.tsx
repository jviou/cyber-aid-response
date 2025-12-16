import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
    <div className="relative flex min-h-screen flex-col">
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </div>
);
