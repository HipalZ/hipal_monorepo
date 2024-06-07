import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import './index.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

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
