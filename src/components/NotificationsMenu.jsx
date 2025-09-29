// src/components/NotificationsMenu.jsx
import { memo, useEffect, useRef, useCallback } from "react"
import PropTypes from "prop-types"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

/**
 * NotificationsMenu
 * - Affiche les plantes à arroser aujourd'hui dans un menu déroulant.
 * - "Stateless" : les données (duePlants) et actions (onWater, onClose) sont passées en props.
 * - Accessibilité : gère Escape, zone cliquable pour fermeture, rôle menu/dialog.
 */
function NotificationsMenu({ open, onClose, duePlants = [], onWater }) {
  const panelRef = useRef(null)
  const closeBtnRef = useRef(null)

  // Ferme au clavier (Escape)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Focus initial sur le menu pour la navigation clavier
  useEffect(() => {
    if (open) {
      // tente le focus sur le premier élément focusable (le bouton "Voir tout")
      closeBtnRef.current?.focus?.()
    }
  }, [open])

  // Marquer une plante comme arrosée (défensif)
  const handleWater = useCallback(
    (id) => { onWater && onWater(id) },
    [onWater]
  )

  // Variantes d'animation
  const variants = {
    hidden: { opacity: 0, y: -6 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.18 } },
    exit:   { opacity: 0, y: -6, transition: { duration: 0.15 } },
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay mobile pour click-away (sous Topbar si besoin) */}
          <button
            aria-label="Fermer les notifications"
            onClick={onClose}
            className="fixed inset-0 z-40 md:hidden cursor-default"
            // button invisible mais focusable pour a11y; on pourrait mettre tabIndex={-1} si non souhaité
            style={{ background: "transparent", outline: "none", border: 0 }}
          />

          {/* Panneau */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="Notifications plantes à arroser"
            initial="hidden"
            animate="show"
            exit="exit"
            variants={variants}
            className="absolute right-0 top-10 z-50 w-80 rounded-xl border bg-white shadow-lg outline-none"
          >
            {/* En-tête */}
            <div className="px-4 py-3 border-b">
              <p className="font-semibold">À arroser aujourd’hui</p>
              <p className="text-xs text-gray-500">
                {duePlants.length > 0
                  ? `${duePlants.length} plante${duePlants.length > 1 ? "s" : ""} à arroser`
                  : "Rien à arroser pour le moment 🎉"}
              </p>
            </div>

            {/* Liste des plantes à arroser */}
            <div className="max-h-80 overflow-auto divide-y">
              {duePlants.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">Reviens plus tard.</div>
              ) : (
                duePlants.map((p) => (
                  <div key={p.id} className="p-3 flex items-center gap-3">
                    <img
                      src={p.imageUrl || "/placeholder-plant.jpg"}
                      alt={p.name ? `Photo de ${p.name}` : "Photo de plante"}
                      className="h-10 w-10 rounded-md object-cover"
                      onError={(e) => { e.currentTarget.src = "/placeholder-plant.jpg" }}
                      loading="lazy"
                      draggable="false"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{p.name || "Sans nom"}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {p.species || "Espèce inconnue"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleWater(p.id)}
                      className="shrink-0 rounded-lg border px-2.5 py-1 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      title="Marquer comme arrosée"
                    >
                      Marquer
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Pied du panneau */}
            <div className="px-4 py-2 border-t text-right">
              <Link
                to="/"
                onClick={onClose}
                ref={closeBtnRef}
                className="text-sm underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
              >
                Voir tout
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ----------------- PropTypes (contrat explicite) ----------------- */
NotificationsMenu.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  duePlants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      species: PropTypes.string,
      imageUrl: PropTypes.string,
    })
  ),
  onWater: PropTypes.func, // (id) => Promise|void
}

NotificationsMenu.defaultProps = {
  open: false,
  onClose: undefined,
  duePlants: [],
  onWater: undefined,
}

export default memo(NotificationsMenu)
