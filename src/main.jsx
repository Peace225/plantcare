import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import "./styles/globals.css"

import App from "./App.jsx";
import AuthPage from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PlantForm from "./pages/PlantForm.jsx";
import HistoryPage from "./pages/History.jsx";   
import SettingsPage from "./pages/Settings.jsx"; 
import Plants from "./pages/Plants.jsx";  
import DevTools from "./pages/DevTools.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="auth" element={<AuthPage />} />
          
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="plants" element={<Plants />} /> 
          <Route path="dev" element={<DevTools />} />

          {/* CRUD */}
          <Route path="new" element={<PlantForm />} />
          <Route path="edit/:id" element={<PlantForm />} />

          {/* Liens Sidebar */}
          <Route path="history/:id" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
