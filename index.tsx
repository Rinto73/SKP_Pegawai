
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

console.log("React Mounting Started...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Target container 'root' not found");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log("React Rendering Initialized");
} catch (err) {
  console.error("Mounting Error:", err);
  rootElement.innerHTML = `<div class="p-20 text-center text-red-600 font-bold">Fatal Mount Error: ${err.message}</div>`;
}
