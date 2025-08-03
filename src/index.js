import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

// Modern forced-colors support - replacing -ms-high-contrast
const style = document.createElement('style');
style.textContent = `
  /* Modern forced-colors support */
  @media (forced-colors: active) {
    * {
      forced-color-adjust: none;
    }
    
    /* Override all Material-UI components */
    .MuiButton-root,
    .MuiIconButton-root,
    .MuiPaper-root,
    .MuiContainer-root,
    .MuiBox-root,
    .MuiTypography-root,
    .MuiTextField-root,
    .MuiDialog-root,
    .MuiTable-root,
    .MuiTableRow-root,
    .MuiTableCell-root,
    .MuiTabs-root,
    .MuiTab-root,
    .MuiAlert-root,
    .MuiSnackbar-root,
    .MuiChip-root,
    .MuiGrid-root,
    .MuiFormControl-root,
    .MuiInputLabel-root,
    .MuiSelect-root,
    .MuiMenuItem-root,
    .MuiAutocomplete-root {
      forced-color-adjust: none;
    }
    
    /* Force all elements */
    html, body, #root, .App {
      forced-color-adjust: none;
    }
  }
  
  /* Light theme support */
  @media (forced-colors: active) and (prefers-color-scheme: light) {
    body {
      background: #40E0D0;
    }
  }
  
  /* Dark theme support */
  @media (forced-colors: active) and (prefers-color-scheme: dark) {
    body {
      background: #008B8B;
    }
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register service worker for PWA functionality
serviceWorker.register({
  onSuccess: () => {
    console.log('MagicSell Driver App is now available offline!');
  },
  onUpdate: (registration) => {
    console.log('New version available!');
    if (window.confirm('New version available! Reload to update?')) {
      window.location.reload();
    }
  }
});

// Request notification permission for delivery updates
serviceWorker.requestNotificationPermission();
