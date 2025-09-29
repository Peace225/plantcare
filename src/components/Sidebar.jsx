// src/components/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { listenAuth, logout } from "../lib/firebase.js"
import { FiHome, FiClock, FiSettings, FiLogOut } from "react-icons/fi"
import { FaLeaf } from "react-icons/fa"
import { GiCactusPot } from "react-icons/gi"

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => listenAuth(setUser), [])
  const doLogout = () => logout().then(() => { onClose?.(); navigate("/auth") })

  const isDashboard = useMemo(
    () => pathname === "/" || pathname === "/dashboard",
    [pathname]
  )

  // Animations
  const sheetVariants = {
    hidden:  { x: -260, opacity: 0.9 },
    visible: { x: 0,    opacity: 1, transition: { type: "tween", duration: 0.25 } },
    exit:    { x: -260, opacity: 0.9, transition: { type: "tween", duration: 0.2 } }
  }

  return (
    <>
      {/* Overlay mobile (sous Topbar) */}
      <div
        onClick={onClose}
        className={`fixed inset-x-0 top-14 bottom-0 bg-black/35 backdrop-blur-[1px] md:hidden transition-opacity
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Sidebar mobile animée */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="side-mobile"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sheetVariants}
            className="fixed top-14 left-0 z-50 h-[calc(100dvh-56px)] w-64
                       bg-white border-r border-emerald-100 shadow-xl md:hidden"
          >
            <SidebarInner
              pathname={pathname}
              isDashboard={isDashboard}
              user={user}
              doLogout={doLogout}
              onClose={onClose}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex fixed top-14 left-0 z-40 h-[calc(100dvh-56px)] w-64
                        bg-white border-r border-emerald-100 shadow-sm">
        <SidebarInner
          pathname={pathname}
          isDashboard={isDashboard}
          user={user}
          doLogout={doLogout}
          onClose={onClose}
          desktop
        />
      </aside>
    </>
  )
}

function SidebarInner({ pathname, isDashboard, user, doLogout, onClose }) {
  // ⚠️ NavItem est défini ICI pour être visible par SidebarInner
  const NavItem = ({ to, active, children }) => (
    <motion.div
      variants={{ hidden:{opacity:0,x:-8}, visible:{opacity:1,x:0,transition:{duration:.18}} }}
    >
      <Link
        to={to}
        onClick={onClose}
        className={`flex items-center gap-3 rounded-xl px-3 py-2 transition
          ${active
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "hover:bg-emerald-50/60 text-zinc-700"
          }`}
      >
        {children}
      </Link>
    </motion.div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <motion.nav
        className="p-4 space-y-1.5 flex-1"
        variants={{
          hidden: { opacity: 0 },
          visible:{ opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } }
        }}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={{ hidden:{opacity:0,y:6}, visible:{opacity:1,y:0,transition:{duration:.18}} }}>
          <div className="text-[13px] tracking-wide text-emerald-700/80 mb-1 px-1">Navigation</div>
        </motion.div>

        <NavItem to="/" active={isDashboard}>
          <FiHome className="shrink-0" /> <span>Dashboard</span>
        </NavItem>

        <NavItem to="/plants" active={pathname.startsWith("/plants")}>
          <FaLeaf className="shrink-0 text-emerald-600" /> <span>Mes Plantes</span>
        </NavItem>

        <NavItem to="/history" active={pathname.startsWith("/history")}>
          <FiClock className="shrink-0" /> <span>Historique</span>
        </NavItem>

        <NavItem to="/settings" active={pathname.startsWith("/settings")}>
          <FiSettings className="shrink-0" /> <span>Paramètres</span>
        </NavItem>
      </motion.nav>

      {/* Footer */}
      <div className="p-4 border-t border-emerald-100">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="mb-3"
        >
          <div className="text-lg font-extrabold tracking-tight text-emerald-700 flex items-center gap-2">
            <GiCactusPot className="w-5 h-5 text-emerald-700" />
            PlantCare
          </div>
          <p className="mt-1 text-xs text-zinc-500 truncate">
            {user?.email || "Invité"}
          </p>
        </motion.div>

        {user ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={doLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2
                       hover:bg-emerald-50/80 text-zinc-700"
          >
            <FiLogOut /> Se déconnecter
          </motion.button>
        ) : (
          <Link
            to="/auth"
            onClick={onClose}
            className="block text-center rounded-xl border border-emerald-200 px-3 py-2
                       hover:bg-emerald-50/70 text-emerald-700"
          >
            Se connecter
          </Link>
        )}
      </div>
    </div>
  )
}
