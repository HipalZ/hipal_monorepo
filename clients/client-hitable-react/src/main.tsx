import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import Boundary from './components/boundary';

import './index.css';

///
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
        <Toaster position="top-center" />
        <Boundary>
          <App />
        </Boundary>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
);
