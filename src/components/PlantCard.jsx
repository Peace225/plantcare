// src/components/PlantCard.jsx
import { memo, useCallback } from "react"
import PropTypes from "prop-types"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  FiCalendar, FiDroplet, FiEdit2, FiTrash2, FiClock,
} from "react-icons/fi"
import { FaLeaf } from "react-icons/fa"

/**
 * Card d'une plante.
 * - Affiche l'image, les métadonnées et les actions (arroser, éditer, supprimer).
 * - Conçue "stateless" : les callbacks viennent du parent (SRP / KISS).
 * - Boutons protégés par des garde-fous (ne crash pas si handler manquant).
 */
function PlantCard({ plant, onWater, onEdit, onDelete }) {
  const {
    id,
    imageUrl,
    name,
    species,
    purchasedAt,
    waterAmountMl,
    waterEveryDays,
    nextWateringAt,
  } = plant || {}

  // ----- Calculs d'affichage -----
  const next = nextWateringAt ? new Date(nextWateringAt) : null
  const due  = next && next.getTime() <= endOfToday().getTime()
  const daysLeft = next
    ? Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // ----- Handlers encapsulés (défensifs) -----
  const handleWater = useCallback(() => { onWater && onWater(plant) }, [onWater, plant])
  const handleEdit  = useCallback(() => { onEdit  && onEdit(plant)  }, [onEdit,  plant])
  const handleDel   = useCallback(() => { onDelete && onDelete(plant) }, [onDelete, plant])

  // ----- Rendu -----
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-emerald-200 transition"
      role="article"
      aria-label={name || "Carte plante"}
    >
      {/* Image (object-contain pour éviter les coupes, fallback sûr) */}
      <div className="w-full h-44 sm:h-40 bg-white overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl || "/placeholder-plant.jpg"}
          alt={name ? `Photo de ${name}` : "Photo de plante"}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = "/placeholder-plant.jpg" }}
          draggable="false"
        />
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-3 flex-1">
        {/* Titre + badge prochain arrosage */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold leading-tight text-emerald-900">
              {name || "Sans nom"}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <FaLeaf className="shrink-0 text-emerald-600" aria-hidden="true" />
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
              <FiClock aria-hidden="true" />
              {due ? "À arroser" : daysLeft === 0 ? "Aujourd’hui" : `J-${daysLeft}`}
            </span>
          )}
        </div>

        {/* Meta : Date d'achat */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiCalendar aria-hidden="true" />
          <span>{purchasedAt ? formatDate(purchasedAt) : "Date d’achat inconnue"}</span>
        </div>

        {/* Besoins en eau */}
        <div className="flex items-center gap-2 text-sm">
          <FiDroplet className="text-emerald-600" aria-hidden="true" />
          <span className="text-gray-700">
            {formatMl(waterAmountMl)} / {formatDays(waterEveryDays)}
          </span>
        </div>
      </div>

      {/* Actions (type=button pour éviter un submit parasite) */}
      <div className="p-4 pt-0 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleWater}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
          title="Marquer arrosé"
        >
          <FiDroplet aria-hidden="true" />
          Arroser
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleEdit}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            title="Modifier"
          >
            <FiEdit2 aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleDel}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-rose-300"
            title="Supprimer"
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Lien Historique (rendu seulement si id dispo) */}
      {id && (
        <div className="px-4 pb-4">
          <Link
            to={`/history/${id}`}
            className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
            title="Voir l’historique d’arrosage"
          >
            <FiClock aria-hidden="true" /> Historique d’arrosage
          </Link>
        </div>
      )}
    </motion.div>
  )
}

/* ----------------- Helpers (petites unités testables) ----------------- */

/** Retourne la fin de journée locale (sert pour comparer les échéances). */
function endOfToday() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

/** Formatte une date (ISO ou Date) -> "JJ mois AAAA". */
function formatDate(value) {
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d?.getTime())) return "—"
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

/** Affiche une quantité d’eau (ml) ou un tiret. */
function formatMl(v) {
  return Number.isFinite(Number(v)) && Number(v) > 0 ? `${v} ml` : "—"
}

/** Affiche une fréquence (jours) ou un tiret. */
function formatDays(v) {
  return Number.isFinite(Number(v)) && Number(v) > 0 ? `${v} j` : "—"
}

/* ----------------- PropTypes (contrat clair, DX & QA) ----------------- */

PlantCard.propTypes = {
  plant: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    imageUrl: PropTypes.string,
    name: PropTypes.string,
    species: PropTypes.string,
    purchasedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    waterAmountMl: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    waterEveryDays: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nextWateringAt: PropTypes.string,
  }),
  onWater: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
}

PlantCard.defaultProps = {
  plant: {},
  onWater: undefined,
  onEdit: undefined,
  onDelete: undefined,
}

// memo() pour éviter des rerenders inutiles quand les props ne changent pas
export default memo(PlantCard)
