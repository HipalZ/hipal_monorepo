import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { APP_ENV, BASE_URL } from '@/configs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

console.log({ APP_ENV, BASE_URL });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastContainer />
        <App />
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
);
