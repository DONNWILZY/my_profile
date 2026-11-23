import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import {DashboardProvider} from './dashboard/DashboardProvider';
import {AppointmentProvider} from './scheduling/AppointmentProvider';
import './styles.css';

// Keep previously shared hash links working while new links use normal paths.
if (window.location.hash.startsWith('#/')) {
  try {
    const legacyRoute = new URL(window.location.hash.slice(1), window.location.origin);
    if (legacyRoute.origin === window.location.origin) {
      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      window.history.replaceState(null, '', `${base}${legacyRoute.pathname}${legacyRoute.search}${legacyRoute.hash}`);
    }
  } catch {
    // An invalid legacy fragment should not prevent the app from opening.
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <DashboardProvider><AppointmentProvider><App/></AppointmentProvider></DashboardProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
