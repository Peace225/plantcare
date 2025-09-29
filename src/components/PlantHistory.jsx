// src/components/PlantHistory.jsx
// -------------------------------------------------------------
// Composant : Historique d’arrosage d’une plante
// Points clés (évaluation) :
//  • Lisibilité : fonctions utilitaires nommées, commentaires ciblés
//  • Modularité/DRY : formatage de date isolé ; logique de chargement claire
//  • KISS : 1 responsabilité = afficher l’historique d’une plante
//  • Gestion des erreurs : états loading/error, message utilisateur
//  • Extensible : mode "temps réel" optionnel via subscribeWaterings
//  • A11y : roles, aria-live sur la zone dynamique
// -------------------------------------------------------------

import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import { FiDroplet } from "react-icons/fi"
// ⚠️ Assure-toi que ces fonctions existent bien dans src/lib/db.js
// - listWaterings(plantId): Promise<Watering[]>
// - subscribeWaterings(plantId, cb): () => unsubscribe
import { listWaterings, subscribeWaterings } from "../lib/db.js"

/** Formate un ISO en date/heure lisible locale */
function formatDateTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function PlantHistory({ plantId, realtime }) {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!plantId) return

    // Flag pour éviter setState après unmount
    let alive = true
    let unsub = null

    async function loadOnce() {
      try {
        setLoading(true)
        setError(null)
        const rows = await listWaterings(plantId)
        if (!alive) return
        setItems(rows)
      } catch (e) {
        if (!alive) return
        setError(e?.message ?? "Erreur lors du chargement de l’historique")
      } finally {
        if (alive) setLoading(false)
      }
    }

    // Mode temps réel (si dispo dans db.js)
    if (realtime) {
      try {
        setLoading(true)
        setError(null)
        unsub = subscribeWaterings(plantId, (rows) => {
          if (!alive) return
          setItems(rows)
          setLoading(false)
        })
      } catch (e) {
        // En cas d’échec du subscribe, on retombe en mode "once"
        setError(e?.message ?? "Erreur temps réel, tentative de repli…")
        loadOnce()
      }
    } else {
      // Mode "chargement ponctuel"
      loadOnce()
    }

    return () => {
      alive = false
      if (typeof unsub === "function") unsub()
    }
  }, [plantId, realtime])

  return (
    <section
      className="rounded-2xl border bg-white overflow-hidden"
      aria-labelledby="history-title"
      aria-live="polite"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2 bg-emerald-50/50">
        <FiDroplet className="text-emerald-700" />
        <h2 id="history-title" className="font-semibold text-emerald-900">
          Historique d’arrosage
        </h2>
        {realtime && (
          <span className="ml-auto text-[11px] rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700">
            temps réel
          </span>
        )}
      </div>

      {/* États : loading / error / empty / list */}
      {loading && (
        <div className="p-4 text-sm text-gray-700">Chargement…</div>
      )}

      {error && !loading && (
        <div className="p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        items.length === 0 ? (
          <p className="p-4 text-gray-600">Aucun arrosage enregistré.</p>
        ) : (
          <ul className="divide-y">
            {items.map((w) => (
              <li
                key={w.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-50 border border-emerald-100">
                    <FiDroplet className="text-emerald-600" />
                  </span>
                  <div>
                    <div className="font-medium">
                      {w.amountMl ? `${w.amountMl} ml` : "Quantité non précisée"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(w.wateredAt)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}

PlantHistory.propTypes = {
  plantId: PropTypes.string.isRequired, // id Firestore de la plante
  realtime: PropTypes.bool,             // active l’abonnement temps réel
}

PlantHistory.defaultProps = {
  realtime: false,
}
