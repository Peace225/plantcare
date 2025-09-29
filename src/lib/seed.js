// src/lib/seed.js
import { createPlant } from "./db.js"

// Insère 5 plantes (imageUrl = nom de fichier local)
export async function seedPlants() {
  const samples = [
    {
      name: "Monstera deliciosa",
      species: "Monstera",
      purchasedAt: "2023-09-01",
      waterAmountMl: 500,
      waterEveryDays: 3,
      nextWateringAt: new Date(Date.now() + 1*24*60*60*1000).toISOString(),
      imageUrl: "monstera.jpg",
    },
    {
      name: "Cactus Saguaro",
      species: "Cactus",
      purchasedAt: "2024-02-15",
      waterAmountMl: 100,
      waterEveryDays: 14,
      nextWateringAt: new Date(Date.now() + 10*24*60*60*1000).toISOString(),
      imageUrl: "cactus.jpg",
    },
    {
      name: "Aloe Vera",
      species: "Aloe",
      purchasedAt: "2022-11-10",
      waterAmountMl: 200,
      waterEveryDays: 7,
      nextWateringAt: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      imageUrl: "aloe.jpg",
    },
    {
      name: "Pothos doré",
      species: "Epipremnum aureum",
      purchasedAt: "2024-06-21",
      waterAmountMl: 300,
      waterEveryDays: 4,
      nextWateringAt: new Date(Date.now() + 2*24*60*60*1000).toISOString(),
      imageUrl: "pothos.jpg",
    },
    {
      name: "Orchidée Phalaenopsis",
      species: "Orchidée",
      purchasedAt: "2025-01-05",
      waterAmountMl: 150,
      waterEveryDays: 5,
      nextWateringAt: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
      imageUrl: "orchid.jpg",
    },
  ]

  for (const p of samples) {
    await createPlant(p)
    console.log("✅ Ajouté :", p.name)
  }
}
