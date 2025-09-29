// src/components/PlantHistory.jsx
import { useEffect, useState } from "react"
import { listWaterings } from "../lib/db.js"
import { FiDroplet } from "react-icons/fi"

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

export default function PlantHistory({ plantId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!plantId) return
    ;(async () => {
      try {
        setLoading(true)
        setItems(await listWaterings(plantId))
      } catch (e) {
        setError(e?.message ?? "Erreur")
      } finally {
        setLoading(false)
      }
    })()
  }, [plantId])

  return (
    <div className="rounded-2xl border bg-white">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <FiDroplet />
        <h2 className="font-semibold">Historique d’arrosage</h2>
      </div>

      {loading && <p className="p-4">Chargement…</p>}
      {error && <p className="p-4 text-red-600">{error}</p>}

      {!loading && !error && (
        items.length === 0 ? (
          <p className="p-4 text-gray-600">Aucun arrosage enregistré.</p>
        ) : (
          <ul className="divide-y">
            {items.map((w) => (
              <li key={w.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 border">
                    <FiDroplet className="text-blue-600" />
                  </span>
                  <div>
                    <div className="font-medium">{w.amountMl ?? "—"} ml</div>
                    <div className="text-xs text-gray-500">{formatDateTime(w.wateredAt)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
