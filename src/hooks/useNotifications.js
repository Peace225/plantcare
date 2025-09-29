// src/hooks/useNotifications.js
import { useEffect, useState } from "react"
import { db, auth } from "../lib/firebase"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"

export function useNotifications(limit = 20) {
  const [items, setItems] = useState([])
  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) { setItems([]); return }
    const q = query(collection(db, `users/${uid}/notifications`), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => setItems([]))
    return () => unsub()
  }, [])
  const unreadCount = items.filter(i => !i.readAt).length
  return { items, unreadCount }
}

export async function markAllRead() {
  // tu peux no-op tant que la sous-collection et les règles ne sont pas prêtes
  return
}
