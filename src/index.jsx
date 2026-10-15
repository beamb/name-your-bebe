import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import * as serviceWorker from './serviceWorker';

createRoot(document.getElementById('root')).render(<App />);

// Remove an existing service worker left by an earlier deployment.
serviceWorker.unregister();
