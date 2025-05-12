
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element and ensure it exists
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Render the app - ensure proper StrictMode wrapping
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
