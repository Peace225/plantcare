// src/pages/PlantForm.jsx
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { z } from "zod"
import { motion } from "framer-motion"
import { GiCactus } from "react-icons/gi"
import { FiImage, FiTrash2, FiArrowLeft, FiSave } from "react-icons/fi"

import { auth } from "../lib/firebase.js"
import { createPlant, updatePlant, getPlant } from "../lib/db.js"
import { uploadPlantImage } from "../lib/storage.js"

// ====== DEBUG ======
const DEBUG = true
const FORCE_NO_UPLOAD = false

const log = (...a) => DEBUG && console.log("[PlantForm]", ...a)
const warn = (...a) => DEBUG && console.warn("[PlantForm]", ...a)
const err  = (...a) => DEBUG && console.error("[PlantForm]", ...a)

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} a dépassé ${ms/1000}s`)), ms)),
  ])

// Validation (URL souple)
const schema = z.object({
  name: z.string().trim().min(2, "Le nom est requis (min 2 caractères)"),
  species: z.string().trim().optional().nullable(),
  purchasedAt: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  waterAmountMl: z.preprocess(Number, z.number().int().positive("Quantité > 0")),
  waterEveryDays: z.preprocess(Number, z.number().int().positive("Jours > 0")),
})

export default function PlantForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    species: "",
    purchasedAt: "",
    imageUrl: "",
    waterAmountMl: 500,
    waterEveryDays: 3,
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  // Charger en édition
  useEffect(() => {
    if (!isEdit) return
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const p = await getPlant(id)
        if (!alive) return
        setForm({
          name: p.name || "",
          species: p.species || "",
          purchasedAt: p.purchasedAt ? p.purchasedAt.slice(0,10) : "",
          imageUrl: p.imageUrl || "",
          waterAmountMl: p.waterAmountMl ?? 500,
          waterEveryDays: p.waterEveryDays ?? 3,
        })
      } catch (e) {
        err("Load error:", e)
        setError(e?.message || "Erreur de chargement")
      } finally {
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id, isEdit])

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : (form.imageUrl || "")),
    [file, form.imageUrl]
  )

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    setFieldErrors({})
    setLoading(true)

    try {
      // 1) Auth
      const uid = auth.currentUser?.uid
      if (!uid) throw new Error("Veuillez vous connecter avant d’enregistrer une plante.")

      // 2) Upload image (optionnel)
      let imageUrl = form.imageUrl?.trim() || ""
      if (!FORCE_NO_UPLOAD && file) {
        try {
          imageUrl = await withTimeout(uploadPlantImage(uid, file), 15000, "Upload image")
        } catch (upErr) {
          warn("Upload failed, continue without image:", upErr)
          imageUrl = ""
        }
      }
      if (!imageUrl) imageUrl = null

      // 3) Validation
      const parsed = schema.safeParse({ ...form, imageUrl })
      if (!parsed.success) {
        // mappe erreurs champ par champ
        const map = {}
        for (const issue of parsed.error.errors) {
          const k = issue.path?.[0]
          if (k) map[k] = issue.message
        }
        setFieldErrors(map)
        const first = parsed.error.errors[0]?.message || "Données invalides"
        throw new Error(first)
      }
      const data = parsed.data

      // 4) Timestamps & prochain arrosage
      const now  = new Date()
      const next = new Date(now)
      next.setDate(next.getDate() + Number(data.waterEveryDays || 3))

      const payload = {
        ...data,
        purchasedAt: data.purchasedAt || null,
        nextWateringAt: next.toISOString(),
        updatedAt: now.toISOString(),
        ...(isEdit ? {} : { createdAt: now.toISOString() }),
      }

      // 5) Écriture Firestore
      if (isEdit) await withTimeout(updatePlant(id, payload), 15000, "Mise à jour Firestore")
      else       await withTimeout(createPlant(payload),     15000, "Création Firestore")

      // 6) Retour dashboard
      navigate("/")
    } catch (e) {
      err("Save failed:", e)
      setError(e?.message || "Erreur lors de l’enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Bandeau / header visuel */}
      <div className="mb-5 -mt-2 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-100 p-4 sm:p-5">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 shadow-sm">
            <GiCactus className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-emerald-900">
              {isEdit ? "Modifier la plante" : "Ajouter une plante"}
            </h1>
            <p className="text-sm text-emerald-900/70">
              Renseignez le nom, l’espèce, la date d’achat et la routine d’arrosage. Ajoutez une image pour la reconnaître d’un coup d’œil.
            </p>
          </div>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-sm hover:bg-emerald-50"
          >
            <FiArrowLeft /> Retour
          </Link>
        </div>
      </div>

      {/* Carte formulaire */}
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white/95 backdrop-blur rounded-2xl border border-emerald-100 shadow-sm p-5 sm:p-6 space-y-6"
      >
        {/* Image */}
        <div className="grid grid-cols-1 sm:grid-cols-[160px,1fr] gap-4">
          <div className="rounded-xl overflow-hidden border border-emerald-100 bg-white relative group">
            <div className="w-full h-40 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="aperçu" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-emerald-600/70 text-sm">
                  <FiImage className="w-6 h-6 mb-1" />
                  Aucune image
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-emerald-900">Image de la plante (optionnel)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e)=> setFile(e.target.files?.[0] || null)}
              className="block text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-emerald-200 file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
            />
            {form.imageUrl && !file && (
              <button
                type="button"
                onClick={()=> setForm(f=>({ ...f, imageUrl: "" }))}
                className="inline-flex items-center gap-2 text-sm text-rose-600 hover:underline w-fit"
              >
                <FiTrash2 /> Supprimer l’image actuelle
              </button>
            )}
            <p className="text-xs text-gray-500">JPG/PNG, recommandé ≤ 2 Mo.</p>
          </div>
        </div>

        {/* Nom & Espèce */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-emerald-900">Nom *</label>
            <input
              className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                ${fieldErrors.name ? "border-rose-300" : "border-emerald-200"}`}
              value={form.name}
              onChange={(e)=> setForm(s=>({ ...s, name: e.target.value }))}
              placeholder="Ex: Monstera Deliciosa"
              required
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-emerald-900">Espèce</label>
            <input
              className="w-full rounded-xl border px-3 py-2 border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              value={form.species}
              onChange={(e)=> setForm(s=>({ ...s, species: e.target.value }))}
              placeholder="Ex: Monstera deliciosa"
            />
          </div>
        </div>

        {/* Date d’achat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-emerald-900">Date d’achat</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2 border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              value={form.purchasedAt}
              onChange={(e)=> setForm(s=>({ ...s, purchasedAt: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">Optionnel — format AAAA-MM-JJ</p>
          </div>
        </div>

        {/* Besoins en eau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-emerald-900">Quantité d’eau (ml) *</label>
            <input
              type="number"
              min="1"
              step="1"
              className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                ${fieldErrors.waterAmountMl ? "border-rose-300" : "border-emerald-200"}`}
              value={form.waterAmountMl}
              onChange={(e)=> setForm(s=>({ ...s, waterAmountMl: e.target.value }))}
              placeholder="500"
              required
            />
            {fieldErrors.waterAmountMl && <p className="mt-1 text-xs text-rose-600">{fieldErrors.waterAmountMl}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-emerald-900">Fréquence (jours) *</label>
            <input
              type="number"
              min="1"
              step="1"
              className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                ${fieldErrors.waterEveryDays ? "border-rose-300" : "border-emerald-200"}`}
              value={form.waterEveryDays}
              onChange={(e)=> setForm(s=>({ ...s, waterEveryDays: e.target.value }))}
              placeholder="3"
              required
            />
            {fieldErrors.waterEveryDays && <p className="mt-1 text-xs text-rose-600">{fieldErrors.waterEveryDays}</p>}
          </div>
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-60 shadow-sm"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"/>
                </svg>
                Enregistrement…
              </span>
            ) : (
              <>
                <FiSave /> {isEdit ? "Enregistrer" : "Ajouter"}
              </>
            )}
          </motion.button>

          <Link
            to="/"
            className="rounded-xl border border-emerald-200 px-4 py-2 hover:bg-emerald-50"
          >
            Annuler
          </Link>
        </div>

        {DEBUG && (
          <div className="text-xs text-gray-600">
            <span className="inline-block rounded bg-gray-100 px-2 py-1 mr-2">DEBUG ON</span>
            <span className="inline-block rounded bg-gray-100 px-2 py-1">FORCE_NO_UPLOAD: {String(FORCE_NO_UPLOAD)}</span>
          </div>
        )}
      </motion.form>
    </div>
  )
}
