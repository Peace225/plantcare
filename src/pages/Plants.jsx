// src/pages/Plants.jsx
import { useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import PlantCard from "../components/PlantCard.jsx"
import { listPlants, markWatered, deletePlant } from "../lib/db.js"

export default function Plants() {
  const { searchQuery = "" } = useOutletContext() || {}

  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [sortBy, setSortBy] = useState("next") // "next" | "name" | "created"

  const load = async () => {
    try {
      setLoading(true)
      setPlants(await listPlants())
    } catch (e) {
      setError(e?.message ?? "Erreur")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  // Liste d'espèces pour le select
  const speciesOptions = useMemo(() => {
    const s = new Set()
    plants.forEach(p => p.species && s.add(p.species))
    return ["all", ...Array.from(s)]
  }, [plants])

  // Filtrage par recherche + espèce
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return plants.filter(p => {
      const okQ = !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.species || "").toLowerCase().includes(q)
      const okSpecies = speciesFilter === "all" ||
        (p.species || "").toLowerCase() === speciesFilter.toLowerCase()
      return okQ && okSpecies
    })
  }, [plants, searchQuery, speciesFilter])

  // Tri
  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === "name") {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    } else if (sortBy === "created") {
      arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    } else {
      // next watering (plus urgent d'abord)
      arr.sort((a, b) => new Date(a.nextWateringAt || 0) - new Date(b.nextWateringAt || 0))
    }
    return arr
  }, [filtered, sortBy])

  const handleWater = async (id) => {
    await markWatered(id)
    await load()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Mes Plantes</h1>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="rounded-xl border px-3 py-2"
          title="Filtrer par espèce"
        >
          {speciesOptions.map(opt => (
            <option key={opt} value={opt}>
              {opt === "all" ? "Toutes les espèces" : opt}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border px-3 py-2"
          title="Trier"
        >
          <option value="next">Prochain arrosage</option>
          <option value="name">Nom (A→Z)</option>
          <option value="created">Ajout (récent d’abord)</option>
        </select>
      </div>

      {loading && <p>Chargement…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        sorted.length === 0 ? (
          <div className="rounded-xl border p-6 text-center text-gray-600">
            {searchQuery || speciesFilter !== "all"
              ? "Aucun résultat avec ces critères."
              : "Aucune plante. Utilise “Ajouter” pour commencer !"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map(p => (
              <PlantCard
                key={p.id}
                plant={p}
                onWater={() => handleWater(p.id)}
                onEdit={() => (location.href = `/edit/${p.id}`)}
                onDelete={() => deletePlant(p.id).then(load)}
              />
            ))}
          </div>
        )
      )}
    </>
  )
}
