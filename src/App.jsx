// src/App.jsx
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useMemo } from "react"
import TopBar from "./components/TopBar.jsx"
import Sidebar from "./components/Sidebar.jsx"

export default function App() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")         // état de recherche global
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Cache la chrome sur /auth
  const hideChrome = useMemo(() => pathname.startsWith("/auth"), [pathname])

  // (Optionnel) Soumission explicite via le bouton "loupe"
  const handleSearch = (q) => {
    setQuery(q)
    if (pathname !== "/") navigate("/")          // ramène sur Dashboard pour voir les résultats
  }

  return (
    <div className="min-h-dvh">
      {!hideChrome && (
        <TopBar
          onOpenSidebar={() => setOpen(true)}
          query={query}
          onQuery={setQuery}
          onSearch={handleSearch}                // si tu utilises la version avec bouton
        />
      )}
      {!hideChrome && <Sidebar open={open} onClose={() => setOpen(false)} />}

      {/* Espace pour la sidebar desktop + topbar sticky */}
      <main className={`${hideChrome ? "" : "md:pl-64 pt-20"} max-w-7xl mx-auto px-4 py-6`}>
        {/* Passe la recherche aux pages enfants */}
        <Outlet context={{ searchQuery: query }} />
      </main>
    </div>
  )
}
