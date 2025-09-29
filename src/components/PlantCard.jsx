// src/components/PlantCard.jsx
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  FiCalendar, FiDroplet, FiEdit2, FiTrash2, FiClock,
} from "react-icons/fi"
import { FaLeaf } from "react-icons/fa"

export default function PlantCard({ plant, onWater, onEdit, onDelete }) {
  const {
    id, imageUrl, name, species, purchasedAt,
    waterAmountMl, waterEveryDays, nextWateringAt,
  } = plant || {}

  const next = nextWateringAt ? new Date(nextWateringAt) : null
  const due  = next && new Date(next).getTime() <= endOfToday().getTime()
  const daysLeft = next
    ? Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-emerald-200 transition"
    >
      {/* Image */}
      <div className="w-full h-44 sm:h-40 bg-white overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl || "/placeholder-plant.jpg"}
          alt={name || "Plante"}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = "/placeholder-plant.jpg" }}
        />
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold leading-tight text-emerald-900">
              {name || "Sans nom"}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <FaLeaf className="shrink-0 text-emerald-600" />
              <span className="truncate">{species || "Espèce inconnue"}</span>
            </div>
          </div>

          {next && (
            <span
              className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                due ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
              }`}
              title="Prochain arrosage"
            >
              <FiClock />
              {due ? "À arroser" : daysLeft === 0 ? "Aujourd’hui" : `J-${daysLeft}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiCalendar />
          <span>{purchasedAt ? formatDate(purchasedAt) : "Date d’achat inconnue"}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <FiDroplet className="text-emerald-600" />
          <span className="text-gray-700">
            {waterAmountMl ? `${waterAmountMl} ml` : "—"} / {waterEveryDays ? `${waterEveryDays} j` : "—"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 grid grid-cols-3 gap-2">
        <button
          onClick={onWater}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 transition"
          title="Marquer arrosé"
        >
          <FiDroplet />
          Arroser
        </button>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 hover:bg-emerald-50 transition"
            title="Modifier"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={onDelete}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 hover:bg-emerald-50 transition"
            title="Supprimer"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* Lien Historique */}
      <div className="px-4 pb-4">
        <Link
          to={`/history/${id}`}
          className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 hover:underline"
          title="Voir l’historique d’arrosage"
        >
          <FiClock /> Historique d’arrosage
        </Link>
      </div>
    </motion.div>
  )
}

// Helpers
function endOfToday() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}
function formatDate(value) {
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d?.getTime())) return "—"
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}
