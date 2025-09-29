// src/components/TopBar.jsx
// -------------------------------------------------------------
// Barre supérieure de l'application (navigation + recherche + actions)
// Objectifs : lisibilité, modularité, accessibilité, gestion d'erreurs simple
// Bonnes pratiques : KISS (composant unique, responsabilités claires),
//                    DRY (callbacks réutilisés), Clean Code (noms parlants)
// -------------------------------------------------------------

import { useState } from "react"
import PropTypes from "prop-types"
import {
  FiMenu, FiPlus, FiSearch, FiHeart, FiBell, FiClock, FiX
} from "react-icons/fi"
import { GiCactusPot } from "react-icons/gi"
import { Link } from "react-router-dom"
import { useNotifications, markAllRead } from "../hooks/useNotifications.js"

export default function TopBar({ onOpenSidebar, query, onQuery, onSearch }) {
  // État d’ouverture du panneau de notifications (UI locale)
  const [openNotif, setOpenNotif] = useState(false)
  // État d’ouverture du tiroir de recherche mobile
  const [openMobileSearch, setOpenMobileSearch] = useState(false)

  // Récupère les notifications + compteur non lus (découplé via hook)
  const { items: notifications, unreadCount } = useNotifications(20)

  /**
   * Ouvre/ferme le panneau, puis marque comme lus si besoin.
   * Gestion d'erreur silencieuse (UX) + log débug possible si nécessaire.
   */
  const toggleNotif = async () => {
    const next = !openNotif
    setOpenNotif(next)
    if (next && unreadCount > 0) {
      try {
        await markAllRead()
      } catch {
        // On ne bloque pas l'UI. (KISS) — Option: logger pour Sentry
      }
    }
  }

  /**
   * Soumission de la recherche (desktop + mobile)
   * - Reste robuste si onSearch est non fourni
   * - Empêche le rechargement de page
   */
  const submitSearch = (e) => {
    e?.preventDefault?.()
    onSearch?.(query ?? "")
  }

  return (
    <header
      className="
        fixed inset-x-0 top-0 z-40 h-14
        bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-100
        backdrop-blur border-b border-emerald-200 shadow-sm
      "
      role="banner"                   // Accessibilité : rôle explicite
      aria-label="Barre d'application"
    >
      <div className="max-w-7xl mx-auto h-full px-3 sm:px-4 flex items-center justify-between gap-2">
        {/* Bouton burger (mobile) — ouvre la navigation latérale */}
        <button
          onClick={onOpenSidebar}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-xl hover:bg-emerald-100/60"
          aria-label="Ouvrir la navigation"
          type="button"
        >
          <FiMenu className="w-6 h-6 text-emerald-700" />
        </button>

        {/* Logo (Cactus + nom) — lien vers la racine */}
        <Link
          to="/"
          className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2 text-emerald-800"
          aria-label="Aller à l'accueil PlantCare"
        >
          <GiCactusPot className="w-6 h-6 text-emerald-700" />
          <span>PlantCare</span>
        </Link>

        {/* Recherche (desktop & tablette) — centrée, non visible sur mobile */}
        <form
          onSubmit={submitSearch}
          className="flex-1 hidden sm:flex items-center justify-center"
          role="search"
          aria-label="Recherche de plantes"
        >
          <div className="relative w-full max-w-md">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query ?? ""}
              onChange={(e) => onQuery?.(e.target.value)}
              placeholder="Rechercher une plante… (nom, espèce)"
              className="
                w-full pl-10 pr-3 py-2 rounded-2xl
                border border-emerald-200 bg-white/90
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                text-sm shadow-inner
              "
              aria-label="Champ de recherche"
            />
          </div>
        </form>

        {/* Actions (droite) */}
        <div className="relative flex items-center gap-1 sm:gap-2">
          {/* Bouton pour ouvrir le tiroir de recherche (mobile) */}
          <button
            onClick={() => setOpenMobileSearch(true)}
            className="sm:hidden p-2 rounded-xl hover:bg-emerald-100/60"
            aria-label="Ouvrir la recherche"
            type="button"
          >
            <FiSearch className="w-5 h-5 text-emerald-700" />
          </button>

          {/* CTA Ajouter — volontairement toujours visible (meilleure découverte) */}
          <Link
            to="/new"
            className="
              inline-flex items-center gap-1.5 px-3 py-2 rounded-xl
              bg-emerald-600 text-white text-sm hover:bg-emerald-700 active:scale-[.98]
              shadow-sm transition
            "
            aria-label="Ajouter une nouvelle plante"
          >
            <FiPlus className="w-4 h-4" /> Ajouter
          </Link>

          {/* Favoris — stateless (démo) */}
          <button
            className="p-2 rounded-xl hover:bg-emerald-100/60"
            title="Favoris"
            type="button"
            aria-label="Voir les favoris"
          >
            <FiHeart className="w-5 h-5 text-rose-500" />
          </button>

          {/* Notifications + badge non lus */}
          <div className="relative">
            <button
              className="relative p-2 rounded-xl hover:bg-emerald-100/60"
              title="Notifications"
              onClick={toggleNotif}
              type="button"
              aria-expanded={openNotif}
              aria-controls="notifications-panel"
              aria-label="Ouvrir les notifications"
            >
              <FiBell className="w-5 h-5 text-emerald-700" />
              {unreadCount > 0 && (
                <span
                  className="
                    absolute -top-0.5 -right-0.5 bg-rose-500 text-white
                    text-[10px] rounded-full px-1
                    shadow ring-2 ring-white/70
                  "
                  aria-label={`${unreadCount} notification(s) non lue(s)`}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Panneau notifications — fermeture au survol sortant (simple UX) */}
            {openNotif && (
              <div
                id="notifications-panel"
                className="
                  absolute right-0 mt-2 w-72 rounded-2xl border border-emerald-100 bg-white shadow-xl
                  overflow-hidden
                "
                onMouseLeave={() => setOpenNotif(false)}
                role="dialog"
                aria-label="Liste des notifications"
              >
                <div className="px-3 py-2 border-b border-emerald-100 text-sm font-semibold text-emerald-800">
                  Notifications
                </div>

                <ul className="max-h-72 overflow-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <li key={n.id} className="px-3 py-2 hover:bg-emerald-50/60">
                        <div className="flex items-start gap-2">
                          <FiClock className="mt-0.5 text-emerald-600" aria-hidden="true" />
                          <div>
                            <div className="text-sm font-medium text-zinc-900">
                              {n.title || "Notification"}
                            </div>
                            <div className="text-xs text-zinc-600">
                              {n.meta || ""}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-6 text-center text-sm text-zinc-500">
                      Aucune notification
                    </li>
                  )}
                </ul>

                {/* Lien vers la page historique — navigation claire */}
                <Link
                  to="/history"
                  className="block px-3 py-2 border-t border-emerald-100 text-xs text-emerald-700 hover:bg-emerald-50/80"
                >
                  Voir tout l’historique
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tiroir de recherche Mobile (overlay + sheet) */}
      {openMobileSearch && (
        <div className="sm:hidden fixed inset-0 z-50" role="dialog" aria-label="Recherche mobile">
          {/* Fond semi-transparent — ferme le tiroir au clic */}
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setOpenMobileSearch(false)}
            aria-label="Fermer la recherche"
            type="button"
          />
          {/* Barre supérieure contenant le champ de recherche */}
          <div className="absolute left-0 right-0 top-0 bg-white shadow-lg border-b border-emerald-100">
            <form onSubmit={submitSearch} className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => setOpenMobileSearch(false)}
                className="p-2 rounded-lg hover:bg-emerald-100/60"
                aria-label="Fermer la recherche"
              >
                <FiX className="w-5 h-5 text-emerald-700" />
              </button>

              <div className="relative flex-1">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
                  aria-hidden="true"
                />
                <input
                  autoFocus
                  type="text"
                  value={query ?? ""}
                  onChange={(e) => onQuery?.(e.target.value)}
                  placeholder="Rechercher une plante…"
                  className="
                    w-full pl-10 pr-3 py-2 rounded-xl border border-emerald-200 bg-white/95
                    focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                    text-sm
                  "
                  aria-label="Champ de recherche mobile"
                />
              </div>

              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm"
                aria-label="Valider la recherche"
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

/* ---------------- PropTypes & Defaults ---------------- */

// SOLID: contrat clair des props, facilite la maintenance et la découverte.
TopBar.propTypes = {
  /** Ouvre la sidebar (mobile). Optionnel pour réutiliser le composant ailleurs. */
  onOpenSidebar: PropTypes.func,

  /** Valeur actuelle du champ de recherche (state remonté depuis App/Layout). */
  query: PropTypes.string,

  /** Setter de la recherche (lifting state up), déclenché à chaque saisie. */
  onQuery: PropTypes.func,

  /** Callback déclenché à la soumission de la recherche (loupe/Enter). */
  onSearch: PropTypes.func,
}

TopBar.defaultProps = {
  onOpenSidebar: () => {},
  query: "",
  onQuery: () => {},
  onSearch: () => {},
}
