import React from 'react';
import ReactDOM from 'react-dom/client';
// Importamos i18n antes que otros componentes para asegurar que esté disponible
import { Provider } from 'react-redux';
import App from './App.tsx';
import './i18n/i18n';
import './index.scss';
import store from './redux/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
