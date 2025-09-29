// src/components/NotificationsMenu.jsx
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

export default function NotificationsMenu({ open, onClose, duePlants = [], onWater }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* click-away */}
          <div onClick={onClose} className="fixed inset-0 z-40 md:hidden" />
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: .18 }}
            className="absolute right-0 top-10 z-50 w-80 rounded-xl border bg-white shadow-lg"
          >
            <div className="px-4 py-3 border-b">
              <p className="font-semibold">À arroser aujourd’hui</p>
              <p className="text-xs text-gray-500">
                {duePlants.length > 0
                  ? `${duePlants.length} plante${duePlants.length>1?'s':''} à arroser`
                  : "Rien à arroser pour le moment 🎉"}
              </p>
            </div>

            <div className="max-h-80 overflow-auto divide-y">
              {duePlants.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">Reviens plus tard.</div>
              ) : duePlants.map(p => (
                <div key={p.id} className="p-3 flex items-center gap-3">
                  <img src={p.imageUrl || "/placeholder-plant.jpg"} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500 truncate">{p.species || "Espèce inconnue"}</div>
                  </div>
                  <button
                    onClick={()=> onWater?.(p.id)}
                    className="shrink-0 rounded-lg border px-2.5 py-1 text-xs hover:bg-gray-50"
                  >
                    Marquer
                  </button>
                </div>
              ))}
            </div>

            <div className="px-4 py-2 border-t text-right">
              <Link to="/" onClick={onClose} className="text-sm underline">Voir tout</Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
