// src/pages/Auth.jsx
import { useState } from "react"
import {
  login,
  register,
  loginWithGoogle,
  loginWithFacebook,
  // redirectWithGoogle, redirectWithFacebook // (option iOS/Safari)
} from "../lib/firebase.js"
import { FcGoogle } from "react-icons/fc"
import { FaFacebook } from "react-icons/fa"
import { GiCactus } from "react-icons/gi"
import { motion } from "framer-motion"

export default function AuthPage() {
  const [mode, setMode] = useState("login") // 'login' | 'signup'
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    try {
      setError(null)
      setLoading(true)
      if (mode === "login") await login(email, password)
      else await register(email, password)
      window.location.href = "/" // redirige vers Dashboard
    } catch (err) {
      setError(humanizeAuthError(err?.message || "Erreur inconnue"))
    } finally {
      setLoading(false)
    }
  }

  async function onGoogle() {
    try {
      setError(null)
      setLoading(true)
      await loginWithGoogle()
      window.location.href = "/"
      // Pour iOS/Safari si popup bloquée :
      // await redirectWithGoogle()
    } catch (err) {
      setError(humanizeAuthError(err?.message || "Erreur Google"))
    } finally {
      setLoading(false)
    }
  }

  async function onFacebook() {
    try {
      setError(null)
      setLoading(true)
      await loginWithFacebook()
      window.location.href = "/"
      // Pour iOS/Safari :
      // await redirectWithFacebook()
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
        {/* Logo + Nom au centre */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 shadow-sm">
              <GiCactus className="w-7 h-7" />
            </span>
            <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">
              PlantCare
            </span>
          </div>
          <p className="mt-2 text-gray-600 text-sm">
            Gérez vos plantes d’intérieur en toute simplicité 🌿 
            
          </p>
         
        </div>

        {/* Carte Auth */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white/95 backdrop-blur rounded-2xl border border-emerald-100 shadow-sm p-5 sm:p-6"
        >
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-emerald-900 text-center">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h1>

          {/* Boutons sociaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              onClick={onGoogle}
              disabled={loading}
              className="
                flex items-center justify-center gap-2 rounded-xl border
                border-emerald-200 px-3 py-2 hover:bg-emerald-50
                disabled:opacity-60 transition
              "
            >
              <FcGoogle size={20} /> Google
            </button>

            <button
              onClick={onFacebook}
              disabled={loading}
              className="
                flex items-center justify-center gap-2 rounded-xl
                bg-blue-600 text-white px-3 py-2 hover:bg-blue-700
                disabled:opacity-60 transition
              "
            >
              <FaFacebook size={20} /> Facebook
            </button>
          </div>

          {/* Séparateur */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-emerald-100" />
            <span className="px-3 text-gray-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-emerald-100" />
          </div>

          {/* Formulaire email/mot de passe */}
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-emerald-900 mb-1">Email</label>
              <input
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
              />
            </div>

            <div>
              <label className="block text-sm text-emerald-900 mb-1">Mot de passe</label>
              <input
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
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

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
                  className="underline text-emerald-700 hover:text-emerald-800"
                  onClick={() => setMode("login")}
                  disabled={loading}
                >
                  Se connecter
                </button>
              </>
            )}
          </p>

          {/* Astuce popup iOS/Safari
          <p className="mt-2 text-xs text-gray-500 text-center">
            Popups bloquées ? Utilisez la connexion par redirection dans le code.
          </p> */}
        </motion.div>

        {/* Footer mini */}
        <p className="mt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} PlantCare — Prenez soin de vos plantes 🌵
        </p>
      </div>
    </div>
  )
}

/** Mappe quelques messages Firebase en messages lisibles */
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
