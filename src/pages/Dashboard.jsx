// src/pages/Dashboard.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import PlantCard from "../components/PlantCard.jsx"
import { FiRefreshCw } from "react-icons/fi"

export default function Dashboard() {
  const navigate = useNavigate()

  // Astuce images : place tes fichiers dans /public/plants/...
  // puis utilise imageUrl: "/plants/aloe.jpg" (sans /src et sans accent)
  const [plants, setPlants] = useState([
    {
      id: 1,
      name: "Aloe Vera",
      species: "Aloes",
      purchasedAt: "2024-09-15",
      waterAmountMl: 500,
      waterEveryDays: 3,
      nextWateringAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      imageUrl: "/src/assets/plants/aloe.jpg",
    },
    {
      id: 2,
      name: "Cactus",
      species: "Echinopsis",
      purchasedAt: "2023-06-10",
      waterAmountMl: 100,
      waterEveryDays: 14,
      nextWateringAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      imageUrl: "/src/assets/plants/cactus.jpg",
    },
    {
      id: 3,
      name: "Orchidée",
      species: "Phalaenopsis",
      purchasedAt: "2025-01-22",
      waterAmountMl: 200,
      waterEveryDays: 7,
      nextWateringAt: new Date(Date.now() + 86400000).toISOString(),
      imageUrl: "/src/assets/plants/orchidée.jpg", // <- évite les accents dans le nom du fichier
    },
  ])

  //  État de rafraîchissement pour spinner/disable
  const [isRefreshing, setIsRefreshing] = useState(false)

  //  Actualiser (simulation : ping visuel + délai court)
  const refreshPlants = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    // ici tu feras: const fresh = await listPlants() ; setPlants(fresh)
    await new Promise(r => setTimeout(r, 500))
    setPlants(prev => [...prev]) // re-crée le tableau (immutabilité)
    setIsRefreshing(false)
  }

  //  Arroser -> nextWateringAt += waterEveryDays
  const handleWater = (id) => {
    setPlants(prev =>
      prev.map(p => {
        if (p.id !== id) return p
        const now = new Date()
        const next = new Date(now)
        next.setDate(now.getDate() + Number(p.waterEveryDays || 3))
        return {
          ...p,
          lastWateredAt: now.toISOString(),
          nextWateringAt: next.toISOString(),
        }
      })
    )
  }

  //  Modifier -> navigation vers le formulaire d’édition
  const handleEdit = (id) => {
    navigate(`/edit/${id}`)
  }

  //  Supprimer -> confirmation + retrait local
  const handleDelete = (id, name) => {
    if (!confirm(`Supprimer “${name || "Sans nom"}” ?`)) return
    setPlants(prev => prev.filter(p => p.id !== id))
  }

  //  Animations
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  }
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Header + bouton Actualiser */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-emerald-900">
          Mes plantes
        </h1>
        <button
          onClick={refreshPlants}
          disabled={isRefreshing}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg 
                      bg-emerald-600 text-white text-sm font-medium 
                      hover:bg-emerald-700 active:scale-95 transition
                      disabled:opacity-60`}
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Actualisation…" : "Actualiser"}
        </button>
      </div>

      {/* Grille responsive */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
      >
        {plants.map(p => (
          <motion.div key={p.id} variants={item} whileHover={{ y: -3 }}>
            <PlantCard
              plant={p}
              onWater={() => handleWater(p.id)}
              onEdit={() => handleEdit(p.id)}
              onDelete={() => handleDelete(p.id, p.name)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
