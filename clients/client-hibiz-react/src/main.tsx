import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer, Zoom } from "react-toastify";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import Boundary from "./components/molecules/boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <Boundary>
          <ToastContainer
            position="top-right"
            autoClose={1500}
            transition={Zoom}
            theme="dark"
            hideProgressBar
            toastClassName="custom-toast-body"
            closeButton={false}
            stacked
          />
          <App />
        </Boundary>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
);
