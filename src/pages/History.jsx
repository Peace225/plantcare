// src/pages/History.jsx
import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { subscribeWaterings, addWatering, getPlant } from "../lib/db.js"
import { FiArrowLeft, FiDroplet, FiClock } from "react-icons/fi"

export default function History() {
  const { id } = useParams()               // id de la plante
  const navigate = useNavigate()

  const [plant, setPlant] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [amount, setAmount] = useState("") // quantité optionnelle pour l'ajout

  // Charger les infos de la plante
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const p = await getPlant(id)
        if (!alive) return
        setPlant(p)
      } catch (e) {
        setErr(e?.message || "Erreur")
      } finally {
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id])

  // Abonnement temps réel à l’historique
  useEffect(() => {
    let unsub
    try {
      unsub = subscribeWaterings(id, setRows)
    } catch (e) {
      setErr(e?.message || "Erreur")
    }
    return () => unsub && unsub()
  }, [id])

  async function onAdd() {
    try {
      await addWatering(id, amount ? Number(amount) : null)
      setAmount("")
    } catch (e) {
      alert(e?.message || "Erreur")
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:underline"
        >
          <FiArrowLeft /> Retour
        </button>
        <Link to={`/edit/${id}`} className="text-sm underline">Modifier la plante</Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold mb-1">
        Historique d’arrosage — {plant?.name || "…"}
      </h1>
      <p className="text-gray-600 mb-4">{plant?.species || ""}</p>

      {/* Ajout rapide */}
      <div className="rounded-xl border p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-3">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium mb-1">Quantité (ml) — optionnel</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e)=> setAmount(e.target.value)}
            placeholder={plant?.waterAmountMl ? `ex: ${plant.waterAmountMl}` : "ex: 300"}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-4 py-2 hover:opacity-90"
        >
          <FiDroplet /> Ajouter un arrosage
        </button>
      </div>

      {/* Liste */}
      {err && <p className="text-red-600">{err}</p>}
      {loading && !plant && <p>Chargement…</p>}

      {!err && rows.length === 0 ? (
        <div className="rounded-xl border p-6 text-center text-gray-600">
          Aucun arrosage enregistré pour cette plante.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((w) => (
            <li
              key={w.id}
              className="rounded-xl border p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 text-emerald-700 p-2">
                  <FiClock />
                </div>
                <div>
                  <div className="font-medium">
                    {formatDateTime(w.wateredAt)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {w.amountMl ? `${w.amountMl} ml` : "Quantité non précisée"}
                  </div>
                </div>
              </div>
              {plant?.waterEveryDays ? (
                <span className="text-xs text-gray-500">
                  Fréquence: {plant.waterEveryDays} j
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatDateTime(v) {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  })
}
