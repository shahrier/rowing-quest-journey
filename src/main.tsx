import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { UpdateNotification } from "./components/pwa/UpdateNotification";

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered: ", registration);
      })
      .catch((registrationError) => {
        console.error(
          "Service Worker registration failed: ",
          registrationError,
        );
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode data-oid="h_veavp">
    <App data-oid="zabuw-v" />
    <UpdateNotification data-oid="j9ggq8s" />
  </React.StrictMode>,
);
