// src/pages/Settings.jsx
import { FiUser, FiBell, FiLock, FiGlobe } from "react-icons/fi"

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Titre */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-emerald-800">
        Paramètres
      </h1>
      <p className="text-gray-600 mb-6">
        Gérez votre compte, vos notifications et vos préférences.
      </p>

      {/* Carte des paramètres */}
      <div className="space-y-5">
        {/* Profil */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition p-5 flex items-start gap-4">
          <div className="rounded-xl bg-emerald-100 text-emerald-700 p-3 shrink-0">
            <FiUser className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-emerald-900">Compte</h2>
            <p className="text-sm text-gray-600">Modifiez vos informations personnelles et mot de passe.</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition p-5 flex items-start gap-4">
          <div className="rounded-xl bg-emerald-100 text-emerald-700 p-3 shrink-0">
            <FiBell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-emerald-900">Notifications</h2>
            <p className="text-sm text-gray-600">Activez ou désactivez les alertes d’arrosage et rappels.</p>
          </div>
        </div>

        {/* Sécurité */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition p-5 flex items-start gap-4">
          <div className="rounded-xl bg-emerald-100 text-emerald-700 p-3 shrink-0">
            <FiLock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-emerald-900">Sécurité</h2>
            <p className="text-sm text-gray-600">Configurez l’authentification et gardez votre compte protégé.</p>
          </div>
        </div>

        {/* Langue */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition p-5 flex items-start gap-4">
          <div className="rounded-xl bg-emerald-100 text-emerald-700 p-3 shrink-0">
            <FiGlobe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-emerald-900">Langue & région</h2>
            <p className="text-sm text-gray-600">Choisissez votre langue et fuseau horaire préférés.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
