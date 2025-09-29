// src/pages/PlantHistoryPage.jsx
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getPlant, markWatered } from "../lib/db.js"
import PlantHistory from "../components/PlantHistory.jsx"

export default function PlantHistoryPage() {
  const { id } = useParams()
  const [plant, setPlant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setPlant(await getPlant(id))
      } catch (e) {
        setError(e?.message ?? "Erreur")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const quickWater = async () => {
    await markWatered(id)
    // Recharger l’entête + la liste
    setPlant(await getPlant(id))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{plant?.name ?? "Plante"}</h1>
          <p className="text-sm text-gray-600">{plant?.species ?? "Espèce inconnue"}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/edit/${id}`} className="rounded-xl border px-4 py-2 hover:bg-gray-50">Modifier</Link>
          <button onClick={quickWater} className="rounded-xl bg-black text-white px-4 py-2">Marquer arrosé</button>
          <Link to="/" className="rounded-xl border px-4 py-2 hover:bg-gray-50">Retour</Link>
        </div>
      </div>

      {/* Image si dispo */}
      {plant?.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border">
          <img src={plant.imageUrl} alt={plant.name} className="w-full h-64 object-cover" />
        </div>
      )}

      <PlantHistory plantId={id} />
    </div>
  )
}
