import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent mouse wheel from accidentally incrementing or decrementing number inputs
document.addEventListener('wheel', (e) => {
  const target = e.target as HTMLElement | null;
  if (target instanceof HTMLInputElement && target.type === 'number') {
    target.blur();
  } else if (document.activeElement instanceof HTMLInputElement && document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
}, { passive: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
