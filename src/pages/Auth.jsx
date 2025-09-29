// src/pages/Auth.jsx
import { useState } from "react"
import {
  login,
  register,
  loginWithGoogle,
  loginWithFacebook,
  // redirectWithGoogle, redirectWithFacebook // (option iOS/Safari si popup bloquées)
} from "../lib/firebase.js"
import { FcGoogle } from "react-icons/fc"
import { FaFacebook } from "react-icons/fa"
import { GiCactus } from "react-icons/gi"
import { motion } from "framer-motion"

/**
 * Page d'authentification
 * - Connexion / Création de compte par email
 * - OAuth Google / Facebook
 * - Design cohérent avec la charte (emerald/teal)
 * - Accessibilité + UX (désactivation lors du chargement, erreurs humanisées)
 */
export default function AuthPage() {
  const [mode, setMode] = useState("login") // 'login' | 'signup'
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Soumission email/mot de passe
  async function onSubmit(e) {
    e.preventDefault()
    if (loading) return // évite double submit
    try {
      setError(null)
      setLoading(true)
      const mail = email.trim()
      if (mode === "login") await login(mail, password)
      else await register(mail, password)
      window.location.href = "/" // redirige vers Dashboard
    } catch (err) {
      setError(humanizeAuthError(err?.message || "Erreur inconnue"))
    } finally {
      setLoading(false)
    }
  }

  // Connexion Google
  async function onGoogle() {
    if (loading) return
    try {
      setError(null)
      setLoading(true)
      await loginWithGoogle()
      window.location.href = "/"
      // iOS/Safari : await redirectWithGoogle()
    } catch (err) {
      setError(humanizeAuthError(err?.message || "Erreur Google"))
    } finally {
      setLoading(false)
    }
  }

  // Connexion Facebook
  async function onFacebook() {
    if (loading) return
    try {
      setError(null)
      setLoading(true)
      await loginWithFacebook()
      window.location.href = "/"
      // iOS/Safari : await redirectWithFacebook()
    } catch (err) {
      setError(humanizeAuthError(err?.message || "Erreur Facebook"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="
        min-h-dvh w-full
        bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-100
        flex items-center justify-center
        px-4 py-10
      "
    >
      <div className="w-full max-w-md">
        {/* Branding (logo + nom + baseline) */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 shadow-sm">
              <GiCactus className="w-7 h-7" aria-hidden="true" />
            </span>
            <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">
              PlantCare
            </span>
          </div>
          <p className="mt-2 text-gray-700 text-sm leading-relaxed">
            Gérez vos plantes d’intérieur en toute simplicité 🌿<br />
            Ajoutez-les, suivez leurs besoins en eau et recevez des rappels d’arrosage.
          </p>
        </div>

        {/* Carte Auth */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white/95 backdrop-blur rounded-2xl border border-emerald-100 shadow-sm p-5 sm:p-6"
        >
          <h1
            className="text-xl sm:text-2xl font-bold mb-4 text-emerald-900 text-center"
            aria-live="polite"
          >
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h1>

          {/* Boutons sociaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={onGoogle}
              disabled={loading}
              className="
                flex items-center justify-center gap-2 rounded-xl border
                border-emerald-200 px-3 py-2 hover:bg-emerald-50
                disabled:opacity-60 transition
              "
              aria-label="Continuer avec Google"
            >
              <FcGoogle size={20} /> Google
            </button>

            <button
              type="button"
              onClick={onFacebook}
              disabled={loading}
              className="
                flex items-center justify-center gap-2 rounded-xl
                bg-blue-600 text-white px-3 py-2 hover:bg-blue-700
                disabled:opacity-60 transition
              "
              aria-label="Continuer avec Facebook"
            >
              <FaFacebook size={20} /> Facebook
            </button>
          </div>

          {/* Séparateur */}
          <div className="flex items-center my-4" role="separator" aria-hidden="true">
            <div className="flex-1 h-px bg-emerald-100" />
            <span className="px-3 text-gray-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-emerald-100" />
          </div>

          {/* Formulaire email/mot de passe */}
          <form onSubmit={onSubmit} className="space-y-3" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm text-emerald-900 mb-1">
                Email
              </label>
              <input
                id="email"
                className="
                  w-full rounded-xl border px-3 py-2
                  border-emerald-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                "
                placeholder="vous@exemple.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                inputMode="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-emerald-900 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                className="
                  w-full rounded-xl border px-3 py-2
                  border-emerald-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                "
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
              />
            </div>

            {/* Erreur lisible */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            )}

            {/* CTA principal */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full rounded-xl bg-emerald-600 text-white px-3 py-2
                hover:bg-emerald-700 disabled:opacity-60 transition
                font-medium shadow-sm
              "
            >
              {loading
                ? "Veuillez patienter…"
                : mode === "login"
                ? "Se connecter"
                : "Créer un compte"}
            </button>
          </form>

          {/* Switch login/signup */}
          <p className="mt-3 text-sm text-gray-600 text-center">
            {mode === "login" ? (
              <>
                Pas de compte ?{" "}
                <button
                  type="button"
                  className="underline text-emerald-700 hover:text-emerald-800"
                  onClick={() => setMode("signup")}
                  disabled={loading}
                >
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà inscrit ?{" "}
                <button
                  type="button"
                  className="underline text-emerald-700 hover:text-emerald-800"
                  onClick={() => setMode("login")}
                  disabled={loading}
                >
                  Se connecter
                </button>
              </>
            )}
          </p>
        </motion.div>

        {/* Footer mini */}
        <p className="mt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} PlantCare — Prenez soin de vos plantes 🌵
        </p>
      </div>
    </div>
  )
}

/** Mappe quelques messages Firebase en messages lisibles (UX) */
function humanizeAuthError(msg) {
  if (!msg) return "Erreur"
  const lower = msg.toLowerCase()
  if (lower.includes("invalid-api-key")) return "Clé API invalide. Vérifie ton fichier .env puis redémarre."
  if (lower.includes("invalid-email")) return "Email invalide."
  if (lower.includes("missing-password")) return "Mot de passe requis."
  if (lower.includes("wrong-password")) return "Mot de passe incorrect."
  if (lower.includes("user-not-found")) return "Aucun compte pour cet email."
  if (lower.includes("email-already-in-use")) return "Cet email est déjà utilisé."
  if (lower.includes("popup-blocked")) return "Popup bloquée. Réessaie ou utilise la connexion par redirection."
  if (lower.includes("unauthorized-domain")) return "Domaine non autorisé. Ajoute localhost/127.0.0.1 dans Firebase > Auth > Settings."
  return msg
}
