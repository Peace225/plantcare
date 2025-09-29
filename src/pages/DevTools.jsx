// src/pages/DevTools.jsx (exemple rapide)


export default function DevTools() {
  return (
    <div className="pt-14 md:pl-64 p-4">
      <button
        onClick={() => pushNotification({ title: "Test notif", meta: "Depuis DevTools" })}
        className="px-4 py-2 rounded-lg bg-black text-white"
      >
        Ajouter une notification de test
      </button>
    </div>
  )
}
