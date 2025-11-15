import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './hooks/useI18n';
import { TourDataProvider } from './hooks/TourDataProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TourDataProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </TourDataProvider>
  </React.StrictMode>
);