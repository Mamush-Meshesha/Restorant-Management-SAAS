import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Suspense } from "react";
import { Provider } from "react-redux"; // import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import { persistor, store } from "./redux/store.ts";
import { Backdrop, CircularProgress } from "@mui/material";

createRoot(document.getElementById("root")!).render(
  <Suspense
    fallback={
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    }
  >
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <BrowserRouter basename="/">
          <App />
        </BrowserRouter>

        <ToastContainer theme="light" autoClose={1000} position="top-center" />
        <Toaster />
      </PersistGate>
    </Provider>
  </Suspense>
);
