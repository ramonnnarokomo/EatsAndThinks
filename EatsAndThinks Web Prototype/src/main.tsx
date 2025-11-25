// src/main.tsx
import React from "react"; // ✅ AGREGADO
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
//import "./styles/globals.css"; 
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);