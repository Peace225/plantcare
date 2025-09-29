// src/layout/Layout.jsx
import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Topbar from "../components/Topbar.jsx"
import Sidebar from "../components/Sidebar.jsx"

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Exemple : cacher chrome sur la page d'auth
  const hideChrome = pathname.startsWith("/auth")

  return (
    <div className="min-h-dvh bg-white">
      {!hideChrome && <Topbar />}

      {/* Sidebar : en desktop on réserve l'espace, en mobile elle est overlay */}
      {!hideChrome && (
        <Sidebar
          open={open}
          onClose={() => setOpen(false)}
          // important: la Sidebar interne doit commencer sous le topbar (mt-14)
        />
      )}

      {/* Contenu */}
      <main
        className={[
          hideChrome ? "" : "pt-14 md:pl-64", // espace Topbar + rail Sidebar desktop
          "max-w-7xl mx-auto px-4 py-6",
        ].join(" ")}
      >
        <Outlet context={{ openSidebar: () => setOpen(true) }} />
      </main>
    </div>
  )
}
