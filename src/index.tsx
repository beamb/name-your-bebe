import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const root = document.getElementById('root');
if (!root) {
  throw new Error('The root element was not found');
}
createRoot(root).render(<App />);

// Remove an existing service worker left by an earlier deployment.
serviceWorker.unregister();
